"use client";

/**
 * NavigateButton
 *
 * Opens Google Maps directions to a place using the Google Maps Universal URL.
 * Uses `destination_place_id` so navigation lands on the exact venue (no fuzzy
 * name matching). On mobile, the Google Maps app intercepts this URL when
 * installed; on desktop it opens maps.google.com in a new tab.
 *
 * Designed to live inside cards that have their own onClick handler — calls
 * stopPropagation so clicking Navigate doesn't also trigger the card click.
 *
 * Props:
 *   placeId  — required. Google place_id.
 *   name     — restaurant name. Used as fallback `destination` text.
 *   address  — optional. Used if name is missing.
 *   size     — "sm" | "md" | "lg". Default "md".
 *   style    — extra style overrides merged onto the button.
 */
export default function NavigateButton({ placeId, name, address, size = "md", style = {} }) {
  if (!placeId) return null;

  const destination = name || address || "";
  const params = new URLSearchParams({ api: "1", destination });
  params.set("destination_place_id", placeId);
  const href = `https://www.google.com/maps/dir/?${params.toString()}`;

  const sizes = {
    sm: { padding: "4px 10px", fontSize: "11px", gap: "4px", iconSize: "11px" },
    md: { padding: "7px 13px", fontSize: "12px", gap: "5px", iconSize: "13px" },
    lg: { padding: "12px 20px", fontSize: "14px", gap: "6px", iconSize: "15px" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      title={`Open directions to ${destination || "this place"} in Google Maps`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: s.gap,
        background: "rgba(245,158,11,0.12)",
        border: "1px solid rgba(245,158,11,0.35)",
        color: "#f59e0b",
        fontWeight: 700,
        fontSize: s.fontSize,
        padding: s.padding,
        borderRadius: "10px",
        textDecoration: "none",
        fontFamily: "'DM Sans', sans-serif",
        cursor: "pointer",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
        lineHeight: 1.2,
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#f59e0b";
        e.currentTarget.style.color = "#030712";
        e.currentTarget.style.borderColor = "#f59e0b";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(245,158,11,0.12)";
        e.currentTarget.style.color = "#f59e0b";
        e.currentTarget.style.borderColor = "rgba(245,158,11,0.35)";
      }}
    >
      <span style={{ fontSize: s.iconSize, lineHeight: 1 }} aria-hidden="true">🧭</span>
      Navigate
    </a>
  );
}
