import type { AppData } from "./store";
import type { ProfileRecord } from "./store-shared";
export { selectReusableAnswer } from "./answer-reuse";

export function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function canonicalKey(company: string, title: string, location: string) {
  return [company, title, location].map(normalizeText).join("|").replace(/\s+/g, "-");
}

export function classifyQuestion(question: string) {
  const lowered = question.toLowerCase();
  if (lowered.includes("why") && lowered.includes("work")) return "motivation";
  if (lowered.includes("project") || lowered.includes("proud")) return "project_example";
  if (lowered.includes("strength")) return "strengths";
  return "general";
}


export function scoreJob(data: AppData, job: { title: string; company: string; location: string; workplace_mode: string }) {
  const profile = data.profile;
  let score = 0;
  const explanation: string[] = [];
  const titleLower = job.title.toLowerCase();
  const companyLower = job.company.toLowerCase();
  const locationLower = job.location.toLowerCase();
  const modeLower = job.workplace_mode.toLowerCase();

  if (profile.preferred_roles.some((role) => titleLower.includes(role.toLowerCase()))) {
    score += 35;
    explanation.push("Title aligns with preferred roles");
  }
  if (profile.preferred_companies.some((company) => companyLower === company.toLowerCase())) {
    score += 20;
    explanation.push("Company is on preferred list");
  }
  if (
    profile.preferred_locations.some((location) => locationLower.includes(location.toLowerCase())) ||
    profile.preferred_locations.some((location) => modeLower === location.toLowerCase())
  ) {
    score += 20;
    explanation.push("Location or workplace mode matches preference");
  }
  if (profile.skills.some((skill) => titleLower.includes(skill.toLowerCase()))) {
    score += 10;
    explanation.push("Role title overlaps with profile skills");
  }
  if (!titleLower.includes("senior") && !titleLower.includes("staff")) {
    score += 10;
    explanation.push("Seniority appears broadly compatible");
  }

  return { fit_score: Math.min(score, 100), explanation: explanation.length ? explanation : ["Needs deeper comparison"] };
}

export async function generateAnswerWithOpenRouter(input: {
  question: string;
  company?: string;
  role?: string;
  jobDescription?: string;
  profile?: ProfileRecord | null;
}) {
  const apiKey =
    process.env.OPENROUTER_API_KEY || process.env.OPENREUTER_API || process.env.OPENROUTER_API || "";
  const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";
  if (!apiKey) return null;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You write concise, credible draft answers for job applications. Use only supplied profile and job context. Do not invent facts.",
        },
        {
          role: "user",
          content: JSON.stringify({
            question: input.question,
            company: input.company,
            role: input.role,
            job_description: input.jobDescription,
            profile: input.profile || null,
            constraints: ["under 180 words", "no bullet points", "specific and practical"],
          }),
        },
      ],
    }),
  });

  if (!response.ok) return null;
  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content?.trim() || null;
}

export async function searchBrave(query: string) {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY || "";
  if (!apiKey) return null;

  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", "10");
  url.searchParams.set("search_lang", "en");
  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "X-Subscription-Token": apiKey,
    },
  });
  if (!response.ok) return null;
  return (await response.json()) as {
    web?: { results?: Array<Record<string, unknown>> };
  };
}
