"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Trophy, ArrowRight, CheckSquare, Square } from "lucide-react";
import Link from "next/link";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  type: "SINGLE" | "MULTIPLE"; // Added type
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Changed to array to support multiple selections
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isMultiple = currentQuestion.type === "MULTIPLE";

  const handleOptionClick = (optionId: string) => {
    if (isAnswerRevealed) return; // Locked

    if (isMultiple) {
      // Toggle selection
      if (selectedOptionIds.includes(optionId)) {
        setSelectedOptionIds(prev => prev.filter(id => id !== optionId));
      } else {
        setSelectedOptionIds(prev => [...prev, optionId]);
      }
    } else {
      // Single choice: Select and auto-submit logic could go here, 
      // but for consistency, we just select it.
      setSelectedOptionIds([optionId]);
    }
  };

  const submitAnswer = () => {
    if (selectedOptionIds.length === 0) return;

    setIsAnswerRevealed(true);

    // Calculate correctness
    const correctOptionIds = currentQuestion.options
      .filter(opt => opt.isCorrect)
      .map(opt => opt.id);

    // Check if selections match exactly (Order doesn't matter)
    const isCorrect = 
      selectedOptionIds.length === correctOptionIds.length &&
      selectedOptionIds.every(id => correctOptionIds.includes(id));

    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIds([]);
      setIsAnswerRevealed(false);
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
          <div className="flex justify-between items-start gap-4">
            <CardTitle>{currentQuestion.text}</CardTitle>
            {isMultiple && (
              <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded whitespace-nowrap">
                Select all that apply
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOptionIds.includes(option.id);
            const isCorrect = option.isCorrect;

            // Determine styling
            let styleClass = "border-slate-200 hover:bg-slate-50";
            
            if (isAnswerRevealed) {
              if (isCorrect) {
                styleClass = "border-green-500 bg-green-50 text-green-700 font-medium";
              } else if (isSelected && !isCorrect) {
                styleClass = "border-red-500 bg-red-50 text-red-700";
              }
            } else if (isSelected) {
              styleClass = "border-blue-500 ring-1 ring-blue-500 bg-blue-50";
            }

            return (
              <div
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all flex justify-between items-center ${styleClass}`}
              >
                <div className="flex items-center gap-3">
                  {isMultiple ? (
                     isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-gray-400" />
                  ) : (
                     <div className={`w-4 h-4 rounded-full border ${isSelected ? "bg-current border-current" : "border-gray-400"}`} />
                  )}
                  <span>{option.text}</span>
                </div>

                {isAnswerRevealed && (
                  <>
                    {isCorrect && <CheckCircle2 className="text-green-600 h-5 w-5" />}
                    {isSelected && !isCorrect && <XCircle className="text-red-600 h-5 w-5" />}
                  </>
                )}
              </div>
            );
          })}

          <div className="mt-6 flex justify-end">
            {!isAnswerRevealed ? (
              <Button 
                onClick={submitAnswer} 
                disabled={selectedOptionIds.length === 0}
                className="w-full sm:w-auto"
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNext} className="w-full sm:w-auto">
                {currentQuestionIndex === quiz.questions.length - 1 ? "Finish Quiz" : "Next Question"} 
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}