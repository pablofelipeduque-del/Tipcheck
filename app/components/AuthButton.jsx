"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

/**
 * AuthButton — Sign in with Google / show user avatar + dropdown when signed in.
 *
 * Uses the existing browser supabase client. Session persists in localStorage
 * (default supabase-js behavior) so signed-in state survives page reloads
 * and navigation. Listens to onAuthStateChange so all instances of this
 * button stay in sync if the user signs in/out anywhere on the page.
 *
 * Props:
 *   dark — boolean, used to match the page's light/dark theme
 */
export default function AuthButton({ dark = false }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Initial state
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    // Keep in sync with auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function handleSignOut() {
    setOpen(false);
    await supabase.auth.signOut();
  }

  if (loading) {
    // Don't render anything while we figure out auth state — avoids a
    // "Sign in" button flashing for a half-second on already-signed-in users.
    return <div style={{ width: "84px", height: "30px" }} aria-hidden="true" />;
  }

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          background: "#f59e0b",
          color: "#030712",
          border: "none",
          fontWeight: 700,
          fontSize: "13px",
          padding: "7px 14px",
          borderRadius: "999px",
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#fbbf24";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#f59e0b";
          e.currentTarget.style.transform = "";
        }}
      >
        <GoogleGlyph />
        Sign in
      </button>
    );
  }

  // Signed in
  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "You";
  const email = user.email || "";
  const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const initial = (name[0] || "?").toUpperCase();

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        title={email}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          background: dark ? "rgba(255,255,255,0.07)" : "#f3f4f6",
          border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`,
          color: dark ? "#e5e7eb" : "#111827",
          fontWeight: 600,
          fontSize: "13px",
          padding: "3px 12px 3px 3px",
          borderRadius: "999px",
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#f59e0b";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = dark
            ? "rgba(255,255,255,0.1)"
            : "#e5e7eb";
        }}
      >
        {avatar ? (
          <img
            src={avatar}
            alt=""
            referrerPolicy="no-referrer"
            style={{ width: "26px", height: "26px", borderRadius: "50%" }}
          />
        ) : (
          <span
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              background: "#f59e0b",
              color: "#030712",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 800,
            }}
          >
            {initial}
          </span>
        )}
        <span
          style={{
            maxWidth: "120px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </span>
      </button>

      {open && (
        <>
          {/* click-outside backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 200 }}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              zIndex: 201,
              background: dark ? "#0d1117" : "#ffffff",
              border: `1px solid ${dark ? "#1f2937" : "#e5e7eb"}`,
              borderRadius: "12px",
              padding: "6px",
              minWidth: "240px",
              boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <div
              style={{
                padding: "10px 12px",
                borderBottom: `1px solid ${dark ? "#1f2937" : "#e5e7eb"}`,
                marginBottom: "4px",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: dark ? "#ffffff" : "#111827",
                  marginBottom: "2px",
                }}
              >
                {name}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: dark ? "#6b7280" : "#9ca3af",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: dark ? "#e5e7eb" : "#374151",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                borderRadius: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = dark
                  ? "rgba(255,255,255,0.06)"
                  : "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span aria-hidden="true">↩</span>
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
