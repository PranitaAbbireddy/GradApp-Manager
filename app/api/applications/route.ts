import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { getExchangeRates, convertToINR } from "@/lib/currency";

// Helper to get authenticated user ID
async function getAuthenticatedUserId() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  return user ? user.id : null;
}

// 1. GET: Retrieve all applications of the authenticated user
export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("GET applications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 2. POST: Create or Update an application
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      country,
      universityName,
      universityAddress,
      worldRanking,
      countryRanking,
      courseName,
      courseWebsite,
      durationMonths,
      gpaRequired,
      gpaComments,
      transcriptsRequired,
      transcriptsComments,
      resumeRequired,
      resumeComments,
      lettersOfRecCount,
      lettersOfRecComments,
      sopRequired,
      sopComments,
      ieltsRequired,
      grePreferred,
      greComments,
      workExpPreferred,
      workExpComments,
      researchExpPreferred,
      researchExpComments,
      appliedBefore,
      openingDate,
      priorityDeadline,
      finalDeadline,
      appFeeOriginal,
      appFeeCurrency,
      tuitionFeeOriginal,
      tuitionFeeCurrency,
      interestRating,
      interestComments,
      status,
      additionalFields
    } = body;

    // Validation
    if (!country || !universityName || !courseName) {
      return NextResponse.json(
        { error: "Country, University Name, and Course Name are required fields." },
        { status: 400 }
      );
    }

    // Server-side live exchange rate calculation
    const rates = await getExchangeRates();
    const appFeeINR = appFeeOriginal ? convertToINR(Number(appFeeOriginal), appFeeCurrency, rates) : null;
    const tuitionFeeINR = tuitionFeeOriginal ? convertToINR(Number(tuitionFeeOriginal), tuitionFeeCurrency, rates) : null;

    const appData = {
      country,
      universityName,
      universityAddress: universityAddress || "",
      worldRanking: worldRanking ? parseInt(worldRanking, 10) : null,
      countryRanking: countryRanking ? parseInt(countryRanking, 10) : null,
      courseName,
      courseWebsite: courseWebsite || "",
      durationMonths: durationMonths ? parseInt(durationMonths, 10) : null,
      gpaRequired: gpaRequired || "",
      gpaComments: gpaComments || "",
      transcriptsRequired: !!transcriptsRequired,
      transcriptsComments: transcriptsComments || "",
      resumeRequired: !!resumeRequired,
      resumeComments: resumeComments || "",
      lettersOfRecCount: lettersOfRecCount ? parseInt(lettersOfRecCount, 10) : 0,
      lettersOfRecComments: lettersOfRecComments || "",
      sopRequired: !!sopRequired,
      sopComments: sopComments || "",
      ieltsRequired: ieltsRequired ? parseFloat(ieltsRequired) : null,
      grePreferred: !!grePreferred,
      greComments: greComments || "",
      workExpPreferred: !!workExpPreferred,
      workExpComments: workExpComments || "",
      researchExpPreferred: !!researchExpPreferred,
      researchExpComments: researchExpComments || "",
      appliedBefore: !!appliedBefore,
      openingDate: openingDate || "",
      priorityDeadline: priorityDeadline || "",
      finalDeadline: finalDeadline || "",
      appFeeOriginal: appFeeOriginal ? parseFloat(appFeeOriginal) : null,
      appFeeCurrency: appFeeCurrency || "USD",
      appFeeINR,
      tuitionFeeOriginal: tuitionFeeOriginal ? parseFloat(tuitionFeeOriginal) : null,
      tuitionFeeCurrency: tuitionFeeCurrency || "USD",
      tuitionFeeINR,
      interestRating: interestRating ? parseInt(interestRating, 10) : 5,
      interestComments: interestComments || "",
      status: status || "Preparing",
      additionalFields: additionalFields ? (typeof additionalFields === 'string' ? additionalFields : JSON.stringify(additionalFields)) : "{}"
    };

    if (id) {
      // Update operation
      const updatedApp = await prisma.application.update({
        where: { id, userId },
        data: appData
      });
      return NextResponse.json(updatedApp);
    } else {
      // Create operation
      // Check for unique constraint violation (same university + same course)
      const existing = await prisma.application.findFirst({
        where: { userId, universityName, courseName }
      });
      
      if (existing) {
        return NextResponse.json(
          { error: "You have already added an application for this course at this university." },
          { status: 409 }
        );
      }

      const newApp = await prisma.application.create({
        data: {
          ...appData,
          userId
        }
      });
      return NextResponse.json(newApp, { status: 201 });
    }
  } catch (error: any) {
    console.error("POST applications error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "An application with this course at this university already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 3. DELETE: Remove an application by ID
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    // Delete only if it belongs to the logged-in user
    await prisma.application.delete({
      where: { id, userId }
    });

    return NextResponse.json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    console.error("DELETE application error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
