"use client"

import React from "react"
import { useForm, useFieldArray, Control, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, PlusCircle } from "lucide-react" // Ensure you have lucide-react (comes with next.js)

// --- 1. Define the Schema (Data Structure) ---
const quizSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  questions: z.array(z.object({
    text: z.string().min(1, "Question text is required"),
    type: z.enum(["SINGLE", "MULTIPLE"]),
    options: z.array(z.object({
      text: z.string().min(1, "Option text is required"),
      isCorrect: z.boolean().default(false),
    })).min(2, "Add at least 2 options"),
  })).min(1, "Add at least 1 question"),
})

type QuizFormValues = z.infer<typeof quizSchema>

// --- 2. Main Page Component ---
export default function QuizCreatorPage() {
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      description: "",
      questions: [
        { 
          text: "", 
          type: "SINGLE", 
          options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }] 
        }
      ],
    },
  })

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: "questions",
  })

  function onSubmit(data: QuizFormValues) {
    console.log("Submitting Quiz Data:", JSON.stringify(data, null, 2))
    alert("Quiz Created! Check console for JSON.")
    // Here you would send 'data' to your API
  }

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Create a New Quiz</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Quiz Info Section */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Senior DevOps Assessment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of the quiz..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Questions Section */}
          <div className="space-y-4">
            {questionFields.map((field, index) => (
              <QuestionCard 
                key={field.id} 
                index={index} 
                control={form.control} 
                removeQuestion={removeQuestion} 
              />
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed border-2 py-6"
            onClick={() => appendQuestion({ 
              text: "", 
              type: "SINGLE", 
              options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }] 
            })}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Next Question
          </Button>

          <div className="sticky bottom-4 bg-background p-4 border-t flex justify-end">
            <Button type="submit" size="lg">Save Quiz</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

// --- 3. Sub-Component for Individual Questions ---
// We split this out to handle the nested "options" array cleanly
function QuestionCard({ 
  index, 
  control, 
  removeQuestion 
}: { 
  index: number, 
  control: Control<QuizFormValues>, 
  removeQuestion: (index: number) => void 
}) {
  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control,
    name: `questions.${index}.options`,
  })

  // We watch the question type to decide if we show radio or checkboxes behavior
  // (In this UI, we just use checkboxes for simplicity, but you can enforce logic later)
  const questionType = useWatch({
    control,
    name: `questions.${index}.type`,
  })

  return (
    <Card className="relative border-l-4 border-l-primary">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Question {index + 1}</CardTitle>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="text-destructive"
            onClick={() => removeQuestion(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Question Text & Type Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <FormField
              control={control}
              name={`questions.${index}.text`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Enter the question here..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-1">
             <FormField
              control={control}
              name={`questions.${index}.type`}
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SINGLE">Single Choice</SelectItem>
                      <SelectItem value="MULTIPLE">Multiple Choice</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Options List */}
        <div className="space-y-2 mt-2">
          <FormLabel className="text-xs text-muted-foreground uppercase font-bold">Options</FormLabel>
          {optionFields.map((option, optionIndex) => (
            <div key={option.id} className="flex items-center gap-2">
              {/* Correct Answer Toggle */}
              <FormField
                control={control}
                name={`questions.${index}.options.${optionIndex}.isCorrect`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className={questionType === "SINGLE" ? "rounded-full" : "rounded-md"} // Visually hint radio vs check
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Option Text */}
              <FormField
                control={control}
                name={`questions.${index}.options.${optionIndex}.text`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder={`Option ${optionIndex + 1}`} {...field} className="h-9" />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Remove Option Button */}
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => removeOption(optionIndex)}
                disabled={optionFields.length <= 2} // Prevent deleting if only 2 options left
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-2 w-full"
            onClick={() => appendOption({ text: "", isCorrect: false })}
          >
            + Add Option
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}