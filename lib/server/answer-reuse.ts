import type { AnswerRecord } from "./store-shared";

export function normalizeAnswerScope(value?: string) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function selectReusableAnswer(
  answers: AnswerRecord[],
  input: { normalizedQuestion: string; questionType: string; company?: string; role?: string },
) {
  const companyScope = normalizeAnswerScope(input.company);
  const roleScope = normalizeAnswerScope(input.role);

  const scopedAnswers = answers.filter((item) => {
    const itemCompany = normalizeAnswerScope(item.company_context);
    const itemRole = normalizeAnswerScope(item.role_context);

    if (companyScope && itemCompany && itemCompany !== companyScope) {
      return false;
    }

    if (roleScope && itemRole && itemRole !== roleScope) {
      return false;
    }

    if (companyScope && !itemCompany) {
      return false;
    }

    return true;
  });

  return (
    scopedAnswers.find(
      (item) =>
        item.question_type === input.questionType &&
        item.normalized_question === input.normalizedQuestion &&
        normalizeAnswerScope(item.company_context) === companyScope &&
        normalizeAnswerScope(item.role_context) === roleScope,
    ) ||
    scopedAnswers.find(
      (item) =>
        item.question_type === input.questionType &&
        item.normalized_question === input.normalizedQuestion &&
        normalizeAnswerScope(item.company_context) === companyScope,
    ) ||
    scopedAnswers.find(
      (item) =>
        item.question_type === input.questionType &&
        item.normalized_question === input.normalizedQuestion,
    ) ||
    (!companyScope
      ? scopedAnswers.find(
          (item) =>
            item.question_type === input.questionType &&
            !item.company_context,
        ) || null
      : null)
  );
}
