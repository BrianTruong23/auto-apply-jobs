import { AnswerWorkbench } from "../../components/answer-workbench";
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
        <AnswerWorkbench initialAnswers={answers} />
      </section>
    </main>
  );
}
