import { forwardRef } from "react";
import type { SlideData } from "@/lib/carouselTypes";

export type SlideVariant = "cover" | "dark" | "light" | "cta" | "cta-dark";

type Props = {
  index: number; // 0..4
  total: number;
  variant: SlideVariant;
  data: SlideData;
  coverImage?: string | null;
  logo?: string | null;
};

const PAD = 40;
const PAD_LEFT = 64;
const W = 1080;
const H = 1440;

const colorsFor = (variant: SlideVariant) => {
  switch (variant) {
    case "cover":
      return { bg: "#0D1B3E", text: "#FFFFFF", muted: "rgba(255,255,255,0.75)", gold: "#C9A84C", decor: "#FFFFFF" };
    case "dark":
      return { bg: "#0D1B3E", text: "#FFFFFF", muted: "rgba(255,255,255,0.75)", gold: "#C9A84C", decor: "#FFFFFF" };
    case "light":
      return { bg: "#F7F5F0", text: "#0D1B3E", muted: "rgba(13,27,62,0.7)", gold: "#C9A84C", decor: "#0D1B3E" };
    case "cta":
      return { bg: "#C9A84C", text: "#0D1B3E", muted: "rgba(13,27,62,0.8)", gold: "#0D1B3E", decor: "#0D1B3E" };
    case "cta-dark":
      return { bg: "#0D1B3E", text: "#FFFFFF", muted: "rgba(255,255,255,0.75)", gold: "#C9A84C", decor: "#FFFFFF" };
  }
};

export const SlideCanvas = forwardRef<HTMLDivElement, Props>(function SlideCanvas(
  { index, total, variant, data, coverImage, logo },
  ref,
) {
  const c = colorsFor(variant);
  const counter = `${String(index + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}`;
  const decorativeNum = String(index + 1);

  const logoFilter =
    variant === "cta"
      ? "brightness(0)"
      : variant === "light"
        ? "none"
        : "brightness(10)";

  return (
    <div
      ref={ref}
      style={{
        width: W,
        height: H,
        position: "relative",
        backgroundColor: c.bg,
        color: c.text,
        overflow: "hidden",
        fontFamily: "var(--font-sans-brand)",
      }}
    >
      {/* Cover background image + overlay */}
      {variant === "cover" && coverImage && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${coverImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(13,27,62,0.75) 0%, rgba(13,27,62,0.75) 100%)",
            }}
          />
        </>
      )}

      {/* Decorative number */}
      <div
        style={{
          position: "absolute",
          right: -40,
          bottom: -120,
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 720,
          lineHeight: 1,
          color: c.decor,
          opacity: 0.08,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {decorativeNum}
      </div>

      {/* Content frame */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          paddingTop: PAD,
          paddingRight: PAD,
          paddingBottom: PAD,
          paddingLeft: PAD_LEFT,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top row: counter */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: c.muted,
          }}
        >
          {logo && variant !== "cta" ? (
            <img
              src={logo}
              alt="logo"
              crossOrigin="anonymous"
              style={{ height: 32, width: "auto", opacity: 0.8, filter: logoFilter, objectFit: "contain" }}
            />
          ) : (
            <span />
          )}
          <span>{counter}</span>
        </div>

        {/* Middle block: tag, divider, title, body, optional CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 880 }}>
          {data.tag && (
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: variant === "light" || variant === "cta" ? c.text : c.gold,
              }}
            >
              {data.tag}
            </div>
          )}
          <div style={{ width: 32, height: 2, backgroundColor: variant === "cta" ? "#0D1B3E" : "#C9A84C" }} />
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 96,
              lineHeight: 1.05,
              color: c.text,
            }}
          >
            {data.titleLine1 && <div>{data.titleLine1}</div>}
            {data.titleLine2 && (
              <div
                style={{
                  fontStyle: "italic",
                  color: variant === "cta" ? "#0D1B3E" : "#C9A84C",
                }}
              >
                {data.titleLine2}
              </div>
            )}
          </div>
          {data.body && (
            <div style={{ fontSize: 32, lineHeight: 1.45, color: c.muted, maxWidth: 820 }}>
              {data.body}
            </div>
          )}
          {variant === "cta" && data.cta && (
            <div style={{ marginTop: 16 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 18,
                  backgroundColor: "#0D1B3E",
                  color: "#FFFFFF",
                  padding: "26px 44px",
                  borderRadius: 999,
                  fontSize: 30,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                }}
              >
                {data.cta}
                <span style={{ color: "#C9A84C", fontSize: 32, lineHeight: 1 }}>→</span>
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: c.muted,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                backgroundColor: variant === "cta" ? "#0D1B3E" : "#C9A84C",
                display: "inline-block",
              }}
            />
            <span style={{ letterSpacing: "0.05em" }}>Lidera Cálculos</span>
          </div>
          {variant === "cover" && (
            <span style={{ letterSpacing: "0.15em", textTransform: "uppercase" }}>
              arraste →
            </span>
          )}
        </div>
      </div>

      {/* CTA: large centered logo at bottom */}
      {variant === "cta" && logo && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: PAD + 60,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <img
            src={logo}
            alt="logo"
            crossOrigin="anonymous"
            style={{ height: 56, width: "auto", opacity: 1, filter: "brightness(0)", objectFit: "contain" }}
          />
        </div>
      )}
    </div>
  );
});

export const SLIDE_WIDTH = W;
export const SLIDE_HEIGHT = H;