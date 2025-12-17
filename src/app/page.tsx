import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Quiz Master</h1>
      
      <div className="space-y-4 text-center">
        
        {/* Shows when user is LOGGED OUT */}
        <SignedOut>
          <p className="mb-4 text-slate-600">Login to start creating quizzes.</p>
          <SignInButton mode="modal">
            <Button>Sign In</Button>
          </SignInButton>
        </SignedOut>

        {/* Shows when user is LOGGED IN */}
        <SignedIn>
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg">Welcome back!</p>
            
            {/* The User Profile Circle */}
            <UserButton afterSignOutUrl="/" />
            
            <Link href="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </div>
        </SignedIn>

      </div>
    </div>
  )
}