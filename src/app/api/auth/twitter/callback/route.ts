import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { handleCallback } from "@/lib/platforms/twitter/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/auth/login", req.nextUrl.origin));
  }

  const oauthToken = req.nextUrl.searchParams.get("oauth_token");
  const oauthVerifier = req.nextUrl.searchParams.get("oauth_verifier");

  if (!oauthToken || !oauthVerifier) {
    return NextResponse.redirect(
      new URL("/personas?error=twitter_auth_missing_params", req.nextUrl.origin)
    );
  }

  // Retrieve stored temporary tokens from cookies
  const storedToken = req.cookies.get("twitter_oauth_token")?.value;
  const storedSecret = req.cookies.get("twitter_oauth_secret")?.value;
  const personaId = req.cookies.get("twitter_persona_id")?.value;

  if (!storedToken || !storedSecret || !personaId) {
    return NextResponse.redirect(
      new URL("/personas?error=twitter_auth_expired", req.nextUrl.origin)
    );
  }

  if (storedToken !== oauthToken) {
    return NextResponse.redirect(
      new URL("/personas?error=twitter_auth_token_mismatch", req.nextUrl.origin)
    );
  }

  try {
    const { screenName } = await handleCallback(
      oauthToken,
      storedSecret,
      oauthVerifier,
      personaId
    );

    // Clear temp cookies
    const response = NextResponse.redirect(
      new URL(`/personas/${personaId}?twitter_connected=${screenName}`, req.nextUrl.origin)
    );
    response.cookies.delete("twitter_oauth_token");
    response.cookies.delete("twitter_oauth_secret");
    response.cookies.delete("twitter_persona_id");

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Twitter Callback] Error:", message);
    return NextResponse.redirect(
      new URL(`/personas?error=twitter_auth_failed`, req.nextUrl.origin)
    );
  }
}
