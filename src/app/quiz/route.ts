import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. FIXED: Add 'await' here
    const { userId } = await auth();

    const body = await req.json();
    const { title, description } = body;

    // 2. Check if user is logged in
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 3. Create the quiz
    const quiz = await db.quiz.create({
      data: {
        userId,
        title,
        description,
      },
    });

    return NextResponse.json({ quizId: quiz.id }, { status: 200 });
  } catch (error) {
    console.error("[QUIZ_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
