import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const userQuizzes = await db.quiz.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: { questions: true },
      },
    },
  });

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Quizzes</h1>
        <Link href="/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Quiz
          </Button>
        </Link>
      </div>

      {userQuizzes.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <h2 className="text-xl font-semibold mb-2 text-slate-900">
            No quizzes yet
          </h2>
          <p className="text-gray-500 mb-6">
            You haven&apos;t created any quizzes yet.
          </p>
          <Link href="/create">
            <Button variant="default">Create your first Quiz</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userQuizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4 h-10 overflow-hidden">
                  {quiz.description || "No description provided."}
                </p>
                <div className="flex justify-between items-center text-sm font-medium pt-4 border-t">
                  <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">
                    {quiz._count.questions} Questions
                  </span>

                  {/* --- NEW BUTTON ADDED HERE --- */}
                  <Link href={`/quiz/${quiz.id}`}>
                    <Button variant="link" className="p-0 text-blue-600">
                      View Details &rarr;
                    </Button>
                  </Link>
                  {/* ----------------------------- */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
