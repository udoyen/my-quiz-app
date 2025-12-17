import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { EditQuestionForm } from "./_components/edit-question-form"; // We will create this component

interface EditPageProps {
  params: Promise<{
    quizId: string;
    questionId: string;
  }>;
}

export default async function EditQuestionPage({ params }: EditPageProps) {
  const { userId } = await auth();
  const { quizId, questionId } = await params;

  if (!userId) redirect("/");

  // Fetch existing data to pre-fill the form
  const question = await db.question.findUnique({
    where: {
      id: questionId,
      quiz: { userId }, // Ensure ownership
    },
    include: {
      options: {
        orderBy: { id: "asc" }, // Keep options in order
      },
    },
  });

  if (!question) redirect(`/quiz/${quizId}`);

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <EditQuestionForm quizId={quizId} question={question} />
    </div>
  );
}
