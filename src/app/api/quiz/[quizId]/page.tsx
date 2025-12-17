import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuizPageProps {
  params: {
    quizId: string;
  };
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // 1. Fetch the specific quiz and its questions
  const quiz = await db.quiz.findUnique({
    where: {
      id: params.quizId,
      userId: userId, // Ensure user owns this quiz
    },
    include: {
      questions: {
        include: {
          options: true, // Get options for each question
        },
      },
    },
  });

  // 2. If quiz doesn't exist or doesn't belong to user, go back
  if (!quiz) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-gray-500 max-w-2xl">
            {quiz.description || "No description provided."}
          </p>
          <Link href={`/quiz/${quiz.id}/add-question`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </Link>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">
          Questions ({quiz.questions.length})
        </h2>

        {quiz.questions.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
            <p className="text-gray-500 mb-4">This quiz has no questions yet.</p>
            <Link href={`/quiz/${quiz.id}/add-question`}>
              <Button variant="outline">Add your first Question</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {quiz.questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {index + 1}. {question.text}
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {question.options.map((option) => (
                      <div 
                        key={option.id} 
                        className={`p-3 rounded border text-sm ${
                          option.isCorrect 
                            ? "bg-green-50 border-green-200 text-green-700 font-medium" 
                            : "bg-white border-slate-200"
                        }`}
                      >
                        {option.text}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}