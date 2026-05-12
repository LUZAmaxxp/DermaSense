import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Patient } from "@/models/Patient";
import { PatientSchema } from "@/lib/validations/patient.schema";
import { nanoid } from "nanoid";

/** GET /api/patients — list all patients */
export async function GET() {
  try {
    await connectDB();
    const patients = await Patient.find({}).sort({ created_at: -1 }).lean();
    return NextResponse.json({ patients });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

/** POST /api/patients — create a new patient */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PatientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();

    const patient_id = `P-${nanoid(6).toUpperCase()}`;
    const patient = await Patient.create({ ...parsed.data, patient_id });

    return NextResponse.json({ patient }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
