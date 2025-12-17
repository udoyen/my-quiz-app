"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckSquare, Square } from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Question, Option } from "@prisma/client";

// Define the type for the data we pass in
type QuestionWithOptions = Question & { options: Option[] };

interface EditQuestionFormProps {
  quizId: string;
  question: QuestionWithOptions;
}

export function EditQuestionForm({ quizId, question }: EditQuestionFormProps) {
  const router = useRouter();

  // 1. Initialize state with EXISTING data
  const [questionText, setQuestionText] = useState(question.text);

  // Extract just the text for the inputs
  const [options, setOptions] = useState(
    question.options.map((opt) => opt.text),
  );

  // Find which indices were correct
  const initialCorrectIndices = question.options
    .map((opt, index) => (opt.isCorrect ? index : -1))
    .filter((index) => index !== -1);

  const [correctIndices, setCorrectIndices] = useState<number[]>(
    initialCorrectIndices,
  );

  const [isMultipleChoice, setIsMultipleChoice] = useState(
    question.type === "MULTIPLE",
  );

  const [isLoading, setIsLoading] = useState(false);

  // --- Same Logic as Add Page Below ---

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const toggleCorrectOption = (index: number) => {
    if (isMultipleChoice) {
      if (correctIndices.includes(index)) {
        setCorrectIndices(correctIndices.filter((i) => i !== index));
      } else {
        setCorrectIndices([...correctIndices, index]);
      }
    } else {
      setCorrectIndices([index]);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (correctIndices.length === 0) {
      alert("Please select at least one correct answer.");
      return;
    }

    setIsLoading(true);

    try {
      // 2. Send PATCH request to specific question ID
      const response = await fetch(`/api/question/${question.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          text: questionText,
          options,
          correctIndices,
          type: isMultipleChoice ? "MULTIPLE" : "SINGLE",
        }),
      });

      if (response.ok) {
        router.push(`/quiz/${quizId}`);
        router.refresh();
      } else {
        alert("Something went wrong");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving updates");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <Link href={`/quiz/${quizId}`}>
          <Button variant="ghost" className="pl-0 hover:pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quiz
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Edit Question</CardTitle>
            <div className="flex items-center space-x-2">
              <Switch
                checked={isMultipleChoice}
                onCheckedChange={(checked) => {
                  setIsMultipleChoice(checked);
                  // Don't reset indices on edit, just let them adjust logic if needed
                  if (!checked && correctIndices.length > 1) {
                    setCorrectIndices([correctIndices[0]]); // Keep only first if switching to single
                  }
                }}
              />
              <Label>Allow Multiple Answers</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Question Text</Label>
              <Input
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <Label className="flex justify-between">
                <span>Answer Options</span>
                <span className="text-sm text-blue-600 font-medium">
                  {isMultipleChoice
                    ? "Select all correct answers"
                    : "Select the one correct answer"}
                </span>
              </Label>

              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleCorrectOption(index)}
                  >
                    {correctIndices.includes(index) ? (
                      <CheckSquare className="h-6 w-6 text-green-600 fill-green-50" />
                    ) : (
                      <Square className="h-6 w-6 text-gray-300 hover:text-green-400" />
                    )}
                  </div>

                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                    className={
                      correctIndices.includes(index)
                        ? "border-green-500 ring-1 ring-green-500 bg-green-50/20"
                        : ""
                    }
                  />
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Question"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
