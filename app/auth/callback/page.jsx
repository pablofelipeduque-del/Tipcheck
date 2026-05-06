"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

/**
 * OAuth callback page.
 *
 * After Google → Supabase auth, Supabase redirects the user back here with a
 * `code` query param. The supabase-js client (with detectSessionInUrl: true,
 * the default) auto-exchanges that code for a session as soon as it loads.
 * We just listen for the SIGNED_IN event and route the user home.
 *
 * If anything goes sideways we still bail out to home after a few seconds
 * so the user is never stranded on this page.
 */
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error_description") || params.get("error");

    if (error) {
      console.error("[AuthCallback] OAuth error:", error);
      router.replace("/?auth_error=" + encodeURIComponent(error));
      return;
    }

    let done = false;

    // Once supabase-js exchanges the code, we get a SIGNED_IN event.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (done) return;
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        // Small delay so the cookie/localStorage write settles before
        // the next page reads the session.
        done = true;
        setTimeout(() => router.replace("/"), 50);
      }
    });

    // Hard fallback: if no event arrived in 4s, route home anyway.
    const fallback = setTimeout(() => {
      if (!done) {
        done = true;
        router.replace("/");
      }
    }, 4000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(fallback);
    };
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#030712",
        color: "#e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        padding: "24px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            border: "3px solid #1f2937",
            borderTopColor: "#f59e0b",
            borderRadius: "50%",
            margin: "0 auto 16px",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ fontSize: "16px", fontWeight: 600 }}>Signing you in…</p>
        <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "6px" }}>
          You'll be redirected in a moment.
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
