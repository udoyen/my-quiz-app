import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Users } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const { userId } = await auth();

  // Optional: If already logged in, you might want to auto-redirect
  // But for this request, we keep the choice visible.

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8 text-center">
        
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Quiz Application
          </h1>
          <p className="text-slate-500 text-xl">
            Select your portal to continue.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          
          {/* CLIENT PORTAL */}
          <Card className="hover:shadow-lg transition-shadow border-t-4 border-blue-500 cursor-pointer">
            <CardHeader>
              <Users className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <CardTitle>Client Access</CardTitle>
              <CardDescription>
                Create and manage your own quizzes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Enter Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* OWNER PORTAL */}
          <Card className="hover:shadow-lg transition-shadow border-t-4 border-purple-600 cursor-pointer">
            <CardHeader>
              <ShieldCheck className="w-12 h-12 text-purple-600 mx-auto mb-2" />
              <CardTitle>Owner Access</CardTitle>
              <CardDescription>
                System administration and global overview.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50">
                  Manage System
                </Button>
              </Link>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}