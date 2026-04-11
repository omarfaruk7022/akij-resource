import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Exam from "@/lib/models/Exam";
import Submission from "@/lib/models/Submission";
import { getTokenFromRequest } from "@/lib/utils/authMiddleware";
import { verifyToken } from "@/lib/utils/jwt";

function authGuard(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

// GET /api/exams/[id]
export async function GET(request, { params }) {
  try {
    const user = authGuard(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;

    const exam = await Exam.findById(id).populate("createdBy", "name email");
    if (!exam)
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    if (user.role === "candidate") {
      const now = new Date();

      // Check if candidate already has a submission (resumed session)
      const existingSubmission = await Submission.findOne({
        exam: exam._id,
        candidate: user.id,
      })
        .select("_id status")
        .lean();

      // If they already have a submission, always allow access (resume or view result)
      if (!existingSubmission) {
        // Only enforce time window for brand-new attempts
        if (now < new Date(exam.startTime)) {
          return NextResponse.json(
            { error: "Exam has not started yet" },
            { status: 403 },
          );
        }
        if (now > new Date(exam.endTime)) {
          return NextResponse.json(
            { error: "Exam has ended" },
            { status: 403 },
          );
        }
      }
    } else if (user.role === "employer") {
      // Safe check — createdBy may or may not be populated
      const createdById = exam.createdBy?._id
        ? exam.createdBy._id.toString()
        : exam.createdBy?.toString();

      if (createdById !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, exam });
  } catch (error) {
    console.error("GET exam error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/exams/[id]
export async function PUT(request, { params }) {
  try {
    const user = authGuard(request);
    if (!user || user.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const exam = await Exam.findById(id);
    if (!exam)
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    const createdById = exam.createdBy?._id
      ? exam.createdBy._id.toString()
      : exam.createdBy?.toString();

    if (createdById !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = [
      "title",
      "totalCandidates",
      "totalSlots",
      "questionSets",
      "questionType",
      "startTime",
      "endTime",
      "duration",
      "questions",
      "negativeMark",
      "negativeMarking",
      "status",
    ];
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) exam[field] = body[field];
    });

    await exam.save();
    return NextResponse.json({ success: true, exam });
  } catch (error) {
    console.error("PUT exam error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/exams/[id]
export async function DELETE(request, { params }) {
  try {
    const user = authGuard(request);
    if (!user || user.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const exam = await Exam.findById(id);
    if (!exam)
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    const createdById = exam.createdBy?._id
      ? exam.createdBy._id.toString()
      : exam.createdBy?.toString();

    if (createdById !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await exam.deleteOne();
    return NextResponse.json({ success: true, message: "Exam deleted" });
  } catch (error) {
    console.error("DELETE exam error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
