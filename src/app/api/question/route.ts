import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    // Updated destructuring to accept correctIndices and type
    const { quizId, text, options, correctIndices, type } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const quiz = await db.quiz.findUnique({
      where: { id: quizId, userId },
    });

    if (!quiz) {
      return new NextResponse("Quiz not found or unauthorized", {
        status: 404,
      });
    }

    const question = await db.question.create({
      data: {
        quizId,
        text,
        type: type || "SINGLE", // Use the type passed from frontend
        options: {
          create: options.map((opt: string, index: number) => ({
            text: opt,
            // Check if this index is in the array of correct indices
            isCorrect: correctIndices.includes(index),
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
