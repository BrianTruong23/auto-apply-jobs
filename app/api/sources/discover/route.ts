import { NextRequest, NextResponse } from "next/server";

import { requireRequestUser } from "@/lib/server/auth";
import { canonicalKey, scoreJob, searchBrave } from "@/lib/server/domain";
import {
  allocateId,
  createRunRecord,
  ensureSeedData,
  getProfileRecord,
  listJobRecords,
  listRunRecords,
  upsertJobRecord,
} from "@/lib/server/repository";

type DiscoveryCandidate = {
  title: string;
  url: string;
  description: string;
  meta_url: { hostname: string };
  source_kind: "brave" | "manual" | "fallback";
  raw_payload: Record<string, unknown>;
};

function splitArray(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRequestUser(request);
    await ensureSeedData(user.id);
    const payload = (await request.json()) as Record<string, unknown>;
    const keywords = splitArray(payload.keywords);
    const companies = splitArray(payload.companies);
    const locations = splitArray(payload.locations);
    const workplaceModes = splitArray(payload.workplace_modes);
    const manualUrls = splitArray(payload.manual_urls);
    const query = [...keywords, ...companies, ...locations, ...workplaceModes, "jobs"].join(" ").trim();

    const brave = await searchBrave(query);
    const braveResults: DiscoveryCandidate[] = (brave?.web?.results || []).map((item) => {
      const raw = item as Record<string, unknown>;
      return {
        title: String(raw.title || (keywords[0] ? toTitleCase(keywords[0]) : "Software Engineer")),
        url: String(raw.url || ""),
        description: String(raw.description || ""),
        meta_url: {
          hostname: String((raw.meta_url as { hostname?: string } | undefined)?.hostname || ""),
        },
        source_kind: "brave",
        raw_payload: raw,
      };
    });
    const manualResults: DiscoveryCandidate[] = manualUrls.map((url) => ({
      title: keywords[0] ? toTitleCase(keywords[0]) : "Software Engineer",
      url,
      description: `Manual URL ingestion for ${url}`,
      meta_url: { hostname: safeHostname(url) },
      source_kind: "manual",
      raw_payload: { url, manual: true },
    }));
    const fallbackResults: DiscoveryCandidate[] =
      braveResults.length || manualResults.length
        ? []
        : [
            {
              title: keywords[0] ? toTitleCase(keywords[0]) : "Software Engineer",
              url: manualUrls[0] || "https://example.com/jobs/example-role",
              description: `${companies[0] || "Example Company"} is hiring in ${locations[0] || "Remote"}.`,
              meta_url: { hostname: "example.com" },
              source_kind: "fallback",
              raw_payload: {
                company: companies[0] || "Example Company",
                location: locations[0] || "Remote",
              },
            },
          ];

    const results: DiscoveryCandidate[] = [...braveResults, ...manualResults, ...fallbackResults];
    const profile = await getProfileRecord(user.id);
    if (!profile) {
      return NextResponse.json({ detail: "Profile is not initialized yet." }, { status: 500 });
    }
    const jobsInStore = await listJobRecords(user.id);
    const existingRuns = await listRunRecords(user.id);
    const data = {
      profile,
      jobs: jobsInStore,
      answers: [],
      applications: [],
      runs: existingRuns,
      sources: [],
    };
    let created = 0;
    const jobs = [];
    for (const item of results) {
      const title = item.title;
      const description = item.description;
      const hostname = item.meta_url.hostname;
      const company =
        companies[0] ||
        hostname.split(".")[0].replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()) ||
        "Unknown Company";
      const location = description.toLowerCase().includes("remote") ? "Remote" : locations[0] || "Unknown";
      const workplace_mode = description.toLowerCase().includes("hybrid")
        ? "hybrid"
        : description.toLowerCase().includes("remote")
          ? "remote"
          : workplaceModes[0] || "unknown";
      const key = canonicalKey(company, title, location);
      const existing = data.jobs.find((job) => job.canonical_key === key);
      const score = scoreJob(data, { title, company, location, workplace_mode });
      const job = {
        id: existing?.id || (await allocateId(user.id, "job")),
        user_id: user.id,
        canonical_key: key,
        company,
        title,
        location,
        workplace_mode,
        status: existing?.status || "discovered",
        fit_score: score.fit_score,
        source:
          item.source_kind === "brave" ? "Brave Search" : item.source_kind === "fallback" ? "Discovery Fallback" : "Manual URL",
        source_url: item.url,
        application_url: item.url,
        posted_at: new Date().toISOString(),
        explanation: score.explanation,
        description_text: description,
        raw_payload: item.raw_payload,
        normalized_payload: { company, title, location, workplace_mode },
      };
      const result = await upsertJobRecord(user.id, job);
      if (result.created) {
        created += 1;
      }
      if (!existing) {
        data.jobs.unshift(job);
      } else {
        Object.assign(existing, job);
      }
      jobs.push(job);
    }

    const runId = await allocateId(user.id, "run");
    await createRunRecord(user.id, {
      id: runId,
      user_id: user.id,
      run_type: "discovery",
      status: brave ? "succeeded" : "partial",
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      summary: `Discovery processed ${results.length} results, created ${created} jobs, updated ${results.length - created} existing jobs.`,
    });

    return NextResponse.json({
      query,
      used_fallback: !brave,
      error: brave ? null : "BRAVE_SEARCH_API_KEY missing or Brave request failed",
      created,
      total_processed: results.length,
      run_id: runId,
      jobs,
    });
  } catch (error) {
    return NextResponse.json({ detail: error instanceof Error ? error.message : "Discovery failed." }, { status: 500 });
  }
}

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (match) => match.toUpperCase());
}

function safeHostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}
