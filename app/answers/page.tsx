import { AuthRequired } from "@/components/auth-required";
import { AnswerWorkbench } from "../../components/answer-workbench";
import { getAnswers, isAuthenticated } from "../../lib/api";

export default async function AnswersPage() {
  if (!(await isAuthenticated())) {
    return <AuthRequired title="Log in to use the answer bank" />;
  }

  const answers = await getAnswers();

  return (
    <main className="page">
      <section className="page-header">
        <div>
          <p className="eyebrow">Answers</p>
          <h1>Application Answers</h1>
          <p>Manage approved responses, adapt them for specific roles, and review every suggested answer before it is used in an application.</p>
        </div>
      </section>

      <AnswerWorkbench initialAnswers={answers} />
    </main>
  );
}
