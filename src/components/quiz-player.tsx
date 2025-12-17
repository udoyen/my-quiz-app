"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define the shape of our data
interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

interface QuizPlayerProps {
  quiz: {
    id: string;
    title: string;
    questions: Question[];
  };
}

export function QuizPlayer({ quiz }: QuizPlayerProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleOptionClick = (option: Option) => {
    if (selectedOptionId) return; // Prevent changing answer

    setSelectedOptionId(option.id);
    const correct = option.isCorrect;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsCorrect(null);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="container mx-auto py-20 max-w-xl">
        <Card className="text-center p-10">
          <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Quiz Completed!</h2>
          <p className="text-xl mb-8">
            You scored <span className="font-bold text-green-600">{score}</span> out of{" "}
            <span className="font-bold">{quiz.questions.length}</span>
          </p>
          <Link href="/dashboard">
            <Button size="lg">Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <span className="text-slate-500">
          {currentQuestionIndex + 1} / {quiz.questions.length}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{currentQuestion.text}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestion.options.map((option) => {
            // Determine styling based on state
            let styleClass = "border-slate-200 hover:bg-slate-50";
            if (selectedOptionId) {
              if (option.id === selectedOptionId) {
                styleClass = isCorrect
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-red-500 bg-red-50 text-red-700";
              } else if (option.isCorrect) {
                styleClass = "border-green-500 bg-green-50 text-green-700";
              }
            }

            return (
              <div
                key={option.id}
                onClick={() => handleOptionClick(option)}
                className={`p-4 border rounded-lg cursor-pointer transition-all flex justify-between items-center ${styleClass}`}
              >
                <span>{option.text}</span>
                {selectedOptionId === option.id && (
                   isCorrect ? <CheckCircle2 className="text-green-600 h-5 w-5" /> 
                             : <XCircle className="text-red-600 h-5 w-5" />
                )}
              </div>
            );
          })}

          {selectedOptionId && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleNext}>
                {currentQuestionIndex === quiz.questions.length - 1 ? "Finish Quiz" : "Next Question"} 
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}