import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Helper type for our user lookup map
type UserMap = { [key: string]: { name: string; email: string } };

export default async function AdminDashboard() {
  const user = await currentUser();

  // 1. SECURITY CHECK
  // If no user, or email doesn't match the Admin Email, kick them out.
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  if (!user || userEmail !== adminEmail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
        <a href="/" className="text-blue-500 hover:underline mt-4">
          Return Home
        </a>
      </div>
    );
  }

  // 2. FETCH ALL QUIZZES
  const allQuizzes = await prisma.quiz.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { questions: true },
      },
    },
  });

  // 3. FETCH USER DETAILS FROM CLERK
  // Get distinct userIds to avoid fetching the same user multiple times
  const uniqueUserIds = [...new Set(allQuizzes.map((q) => q.userId))];

  // Fetch the list of users from Clerk
  const client = await clerkClient();
  const usersResponse = await client.users.getUserList({
    userId: uniqueUserIds,
    limit: 100,
  });

  // Create a quick lookup map: ID -> Name/Email
  const userMap: UserMap = {};

  // Handle pagination response structure if necessary
  const userList = "data" in usersResponse ? usersResponse.data : usersResponse;

  userList.forEach((u) => {
    const primaryEmail = u.emailAddresses.find(
      (e) => e.id === u.primaryEmailAddressId
    )?.emailAddress;
    const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();

    userMap[u.id] = {
      name: fullName || "Unnamed User",
      email: primaryEmail || "No Email",
    };
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>
        <Badge variant="secondary" className="text-sm px-4 py-1">
          Admin: {userEmail}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Quizzes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allQuizzes.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Client Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Quiz Title</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allQuizzes.map((quiz) => {
                const creator = userMap[quiz.userId];

                return (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">
                      {/* Show Name if found, otherwise fall back to 'Unknown' */}
                      {creator ? creator.name : "Unknown User"}
                    </TableCell>
                    <TableCell>{quiz.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{quiz._count.questions}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right text-slate-500 text-sm">
                      {creator ? creator.email : quiz.userId}
                    </TableCell>
                  </TableRow>
                );
              })}
              {allQuizzes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No quizzes found in the system.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}