import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Google Calendar MCP: Connect Google Calendar to AI Assistants";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Blue glow accent */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "9999px",
            border: "1px solid rgba(59,130,246,0.3)",
            background: "rgba(59,130,246,0.1)",
            marginBottom: "24px",
          }}
        >
          <span style={{ fontSize: "14px", color: "#60a5fa" }}>
            MCP Server for Google Calendar
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: "16px",
            display: "flex",
          }}
        >
          Google Calendar, inside your AI tools.
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "22px",
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: "700px",
            display: "flex",
          }}
        >
          Calendar management for Claude Code, Cursor, Windsurf, and Kiro
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            fontSize: "16px",
            color: "#71717a",
          }}
        >
          <span>gcalmcp.com</span>
          <span style={{ color: "#3f3f46" }}>|</span>
          <span>$5 one-time</span>
          <span style={{ color: "#3f3f46" }}>|</span>
          <span>14 tools</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
