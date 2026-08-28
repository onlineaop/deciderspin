import { ImageResponse } from "next/og";

// Required for `output: "export"` — file-convention routes need an explicit
// static opt-in or the build fails.
export const dynamic = "force-static";

// Single shared social-share image for the whole site. Next.js's file-based
// convention picks the nearest ancestor's opengraph-image for any route that
// doesn't define its own, so this one image (generated once at build time,
// static-export compatible) automatically backs every page's og:image /
// twitter:image — /rock-paper-scissors/, /coin-flip/, etc. all inherit it.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "DeciderSpin — Spin the Wheel & Magic 8 Ball";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(-225deg, #ff057c 0%, #8d0b93 50%, #321575 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 64,
            letterSpacing: -1,
            marginBottom: 28,
          }}
        >
          🎡 🎱 ✊✌️ 🪙 🎲
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: -2,
          }}
        >
          DeciderSpin
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            color: "rgba(255,255,255,0.88)",
            marginTop: 20,
          }}
        >
          Can&apos;t decide? Let fate decide instantly.
        </div>
      </div>
    ),
    { ...size }
  );
}
