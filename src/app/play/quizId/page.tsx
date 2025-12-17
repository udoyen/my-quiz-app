import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { QuizPlayer } from "@/components/quiz-player";

interface PlayPageProps {
  params: Promise<{
    quizId: string;
  }>;
}

export default async function PlayPage({ params }: PlayPageProps) {
  // 1. Unwrap params (Next.js 15)
  const { quizId } = await params;

  // 2. Fetch quiz with all questions and options
  const quiz = await db.quiz.findUnique({
    where: {
      id: quizId,
    },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Oops!</h1>
        <p>This quiz is empty or does not exist.</p>
      </div>
    );
  }

  // 3. Render the Player
  return <QuizPlayer quiz={quiz} />;
}