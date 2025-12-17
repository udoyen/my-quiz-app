"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateQuizPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to the "Builder" page (we will make this next)
        // For now, let's redirect to dashboard to verify it works
        router.push("/dashboard"); 
        router.refresh(); // Refresh so the new quiz appears
      } else {
        alert("Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create quiz.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-20 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Name your Quiz</CardTitle>
          <CardDescription>
            Give your quiz a catchy title and a short description.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input 
                placeholder="e.g. JavaScript Basics" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <Textarea 
                placeholder="e.g. Test your knowledge of ES6 features..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Next Step"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}