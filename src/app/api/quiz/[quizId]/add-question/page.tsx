"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label"; // You might need to install this
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

interface AddQuestionPageProps {
  params: {
    quizId: string;
  };
}

export default function AddQuestionPage({ params }: AddQuestionPageProps) {
  const router = useRouter();
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState<number>(0); // Default to first option
  const [isLoading, setIsLoading] = useState(false);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/question", {
        method: "POST",
        body: JSON.stringify({
          quizId: params.quizId,
          text: questionText,
          options,
          correctAnswerIndex: correctOption,
        }),
      });

      if (response.ok) {
        router.push(`/quiz/${params.quizId}`);
        router.refresh();
      } else {
        alert("Something went wrong");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving question");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <div className="mb-6">
        <Link href={`/quiz/${params.quizId}`}>
          <Button variant="ghost" className="pl-0 hover:pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quiz
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Question Text */}
            <div className="space-y-2">
              <Label>Question Text</Label>
              <Input
                placeholder="e.g. What is the capital of France?"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
              />
            </div>

            {/* Options */}
            <div className="space-y-4">
              <Label>Answer Options (Select the correct one)</Label>
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div 
                    className="cursor-pointer text-gray-400 hover:text-green-600 transition-colors"
                    onClick={() => setCorrectOption(index)}
                  >
                    {correctOption === index ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </div>
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                    className={correctOption === index ? "border-green-500 ring-1 ring-green-500" : ""}
                  />
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Question"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}