import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { RegisterSchema } from "@/lib/validations/settings.schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, role, ward, password } = parsed.data;

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà." },
        { status: 409 }
      );
    }

    const password_hash = await bcryptjs.hash(password, 12);

    await User.create({
      name,
      email: email.toLowerCase(),
      role,
      ward: ward ?? "",
      password_hash,
    });

    return NextResponse.json({ message: "Compte créé avec succès." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
