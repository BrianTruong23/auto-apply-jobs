import { NextRequest, NextResponse } from "next/server";

import { canonicalKey, scoreJob, searchBrave } from "@/lib/server/domain";
import { nextId, readStore, writeStore } from "@/lib/server/store";

function splitArray(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Record<string, unknown>;
  const keywords = splitArray(payload.keywords);
  const companies = splitArray(payload.companies);
  const locations = splitArray(payload.locations);
  const workplaceModes = splitArray(payload.workplace_modes);
  const manualUrls = splitArray(payload.manual_urls);
  const query = [...keywords, ...companies, ...locations, ...workplaceModes, "jobs"].join(" ").trim();

  const brave = await searchBrave(query);
  const braveResults = brave?.web?.results || [];
  const manualResults = manualUrls.map((url) => ({
    title: keywords[0] ? toTitleCase(keywords[0]) : "Software Engineer",
    url,
    description: `Manual URL ingestion for ${url}`,
    meta_url: { hostname: safeHostname(url) },
  }));
  const fallbackResults =
    braveResults.length || manualResults.length
      ? []
      : [
          {
            title: keywords[0] ? toTitleCase(keywords[0]) : "Software Engineer",
            url: manualUrls[0] || "https://example.com/jobs/example-role",
            description: `${companies[0] || "Example Company"} is hiring in ${locations[0] || "Remote"}.`,
            meta_url: { hostname: "example.com" },
          },
        ];

  const results = [...braveResults, ...manualResults, ...fallbackResults] as Array<Record<string, unknown>>;
  const data = await readStore();
  let created = 0;
  const jobs = results.map((item) => {
    const title = String(item.title || (keywords[0] ? toTitleCase(keywords[0]) : "Software Engineer"));
    const description = String(item.description || "");
    const hostname = String((item.meta_url as { hostname?: string } | undefined)?.hostname || "");
    const company = companies[0] || hostname.split(".")[0].replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()) || "Unknown Company";
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
      id: existing?.id || nextId("job", data.jobs.map((row) => row.id)),
      canonical_key: key,
      company,
      title,
      location,
      workplace_mode,
      status: existing?.status || "discovered",
      fit_score: score.fit_score,
      source: braveResults.includes(item) ? "Brave Search" : fallbackResults.includes(item) ? "Discovery Fallback" : "Manual URL",
      source_url: String(item.url || ""),
      application_url: String(item.url || ""),
      posted_at: new Date().toISOString(),
      explanation: score.explanation,
      description_text: description,
      raw_payload: item,
      normalized_payload: { company, title, location, workplace_mode },
    };
    if (!existing) {
      data.jobs.unshift(job);
      created += 1;
    } else {
      Object.assign(existing, job);
    }
    return job;
  });

  const runId = nextId("run", data.runs.map((item) => item.id));
  data.runs.unshift({
    id: runId,
    run_type: "discovery",
    status: brave ? "succeeded" : "partial",
    started_at: new Date().toISOString(),
    finished_at: new Date().toISOString(),
    summary: `Discovery processed ${results.length} results, created ${created} jobs, updated ${results.length - created} existing jobs.`,
  });
  await writeStore(data);

  return NextResponse.json({
    query,
    used_fallback: !brave,
    error: brave ? null : "BRAVE_SEARCH_API_KEY missing or Brave request failed",
    created,
    total_processed: results.length,
    run_id: runId,
    jobs,
  });
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
