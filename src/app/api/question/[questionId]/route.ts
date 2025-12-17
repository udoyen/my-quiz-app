import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ questionId: string }> },
) {
  try {
    const { userId } = await auth();
    const { questionId } = await params;
    const body = await req.json();
    const { text, options, correctIndices, type } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Verify ownership (Ensure user owns the quiz this question belongs to)
    const existingQuestion = await db.question.findUnique({
      where: { id: questionId },
      include: { quiz: true },
    });

    if (!existingQuestion || existingQuestion.quiz.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // 2. Update Question using a Transaction
    // We delete old options and create new ones to ensure clean state
    await db.$transaction([
      // Delete old options
      db.option.deleteMany({
        where: { questionId: questionId },
      }),
      // Update question text and create new options
      db.question.update({
        where: { id: questionId },
        data: {
          text,
          type,
          options: {
            create: options.map((opt: string, index: number) => ({
              text: opt,
              isCorrect: correctIndices.includes(index),
            })),
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[QUESTION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
