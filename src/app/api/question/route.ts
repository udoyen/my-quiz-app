import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { quizId, text, options, correctAnswerIndex } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Verify user owns the quiz
    const quiz = await db.quiz.findUnique({
      where: {
        id: quizId,
        userId,
      },
    });

    if (!quiz) {
      return new NextResponse("Quiz not found or unauthorized", { status: 404 });
    }

    // 2. Create the question AND the options in one go
    const question = await db.question.create({
      data: {
        quizId,
        text,
        type: "SINGLE", // Assuming single choice for now
        options: {
          create: options.map((opt: string, index: number) => ({
            text: opt,
            isCorrect: index === correctAnswerIndex,
          })),
        },
      },
    });

    return NextResponse.json(question, { status: 200 });

  } catch (error) {
    console.error("[QUESTION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}