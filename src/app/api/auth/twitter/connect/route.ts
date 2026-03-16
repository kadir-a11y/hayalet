import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateAuthLink } from "@/lib/platforms/twitter/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const personaId = req.nextUrl.searchParams.get("personaId");
  if (!personaId) {
    return NextResponse.json({ error: "personaId is required" }, { status: 400 });
  }

  const callbackUrl = process.env.TWITTER_CALLBACK_URL
    || `${req.nextUrl.origin}/api/auth/twitter/callback`;

  try {
    const { oauthToken, oauthTokenSecret, authUrl } = await generateAuthLink(callbackUrl);

    // Store temporary tokens in a cookie for the callback
    const response = NextResponse.redirect(authUrl);
    response.cookies.set("twitter_oauth_token", oauthToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 600, // 10 minutes
      path: "/",
    });
    response.cookies.set("twitter_oauth_secret", oauthTokenSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
      path: "/",
    });
    response.cookies.set("twitter_persona_id", personaId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
