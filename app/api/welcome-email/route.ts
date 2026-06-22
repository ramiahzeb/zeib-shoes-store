import { NextResponse } from "next/server";
import { z } from "zod";
import { sendWelcomeEmail } from "@/lib/email/welcome";

const welcomeEmailSchema = z.object({
  name: z.string().min(2),
  email: z.email()
});

export async function POST(request: Request) {
  try {
    const payload = welcomeEmailSchema.parse(await request.json());
    const result = await sendWelcomeEmail(payload);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid welcome email request." }, { status: 400 });
  }
}
