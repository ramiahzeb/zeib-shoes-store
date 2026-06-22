type WelcomeEmailInput = {
  name: string;
  email: string;
};

export async function sendWelcomeEmail(input: WelcomeEmailInput) {
  const resendKey = process.env.RESEND_API_KEY;
  const sendGridKey = process.env.SENDGRID_API_KEY;

  // TODO: Add RESEND_API_KEY or SENDGRID_API_KEY in Vercel/server env vars before sending real email.
  // TODO: Implement the selected provider SDK call here. Keep this server-only.
  if (!resendKey && !sendGridKey) {
    return {
      ok: true,
      demo: true,
      message: `Demo email queued for ${input.email}`
    };
  }

  return {
    ok: true,
    demo: false,
    subject: "Welcome to ZEIB SHOES",
    body: `Thank you for joining ZEIB SHOES. Walk With Confidence. Welcome, ${input.name}!`
  };
}
