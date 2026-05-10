import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Patient } from "@/models/Patient";
import { PatientSchema } from "@/lib/validations/patient.schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const patient = await Patient.findOne({ patient_id: id }).lean();
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ patient });
  } catch (err) {
    console.error("[GET /api/patients/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const body = await req.json();
    const parsed = PatientSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const patient = await Patient.findOneAndUpdate(
      { patient_id: id },
      { $set: parsed.data },
      { new: true }
    ).lean();

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ patient });
  } catch (err) {
    console.error("[PATCH /api/patients/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
