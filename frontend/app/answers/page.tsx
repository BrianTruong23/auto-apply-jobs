import { getAnswers } from "../../lib/api";

export default async function AnswersPage() {
  const answers = await getAnswers();

  return (
    <main className="page">
      <section className="panel">
        <div className="panel-header">
          <h1>Answer Bank</h1>
          <p>Store approved answers, reuse them when similar questions appear, and only escalate to LLM drafting when needed.</p>
        </div>
        <div className="stack">
          {answers.map((answer) => (
            <article className="answer-card" key={answer.id}>
              <div className="row">
                <strong>{answer.questionType}</strong>
                <span className="badge">{answer.usageCount} uses</span>
              </div>
              <p className="muted">{answer.normalizedQuestion}</p>
              <p>{answer.answerText}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
