// app/api/auth/youtube/callback/route.js

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");

  // Handle any errors from the OAuth process
  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(
      `${requestUrl.origin}/youtube-auth?error=${error}`
    );
  }

  // If no code was returned, redirect back with an error
  if (!code) {
    return NextResponse.redirect(
      `${requestUrl.origin}/youtube-auth?error=no_code`
    );
  }

  // Set up the Supabase client
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Check if the user is authenticated with Supabase
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      // User is not authenticated, redirect to signup
      console.error("No session found during OAuth callback");
      return NextResponse.redirect(
        `${requestUrl.origin}/signup?error=no_session&from=youtube_auth`
      );
    }

    // Exchange the code for tokens
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    const redirectUri = `${requestUrl.origin}/api/auth/youtube/callback`;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Error exchanging code for tokens:", tokenData);
      return NextResponse.redirect(
        `${requestUrl.origin}/youtube-auth?error=token_exchange_failed`
      );
    }

    // Calculate token expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    // Store tokens in the database
    const { error: tokenStoreError } = await supabase
      .from("user_youtube_tokens")
      .upsert(
        {
          user_id: session.user.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || "", // Some flows might not return a refresh token
          expires_at: expiresAt.toISOString(),
          scopes: ["https://www.googleapis.com/auth/youtube.readonly"],
        },
        { onConflict: "user_id" }
      );

    if (tokenStoreError) {
      console.error("Error storing tokens:", tokenStoreError);
      return NextResponse.redirect(
        `${requestUrl.origin}/youtube-auth?error=token_storage_failed`
      );
    }

    // Redirect to setup page for channel selection
    return NextResponse.redirect(`${requestUrl.origin}/setup`);
  } catch (error) {
    console.error("OAuth process error:", error);
    return NextResponse.redirect(
      `${requestUrl.origin}/youtube-auth?error=oauth_process_failed`
    );
  }
}
