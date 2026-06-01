import { forwardRef, type CSSProperties } from "react";
import type { SlideData } from "@/lib/carouselTypes";

export type SlideVariant =
  | "cover"
  | "cover-light"
  | "cover-gold"
  | "dark"
  | "light"
  | "cta"
  | "cta-dark"
  | "cta-light";

type Props = {
  index: number; // 0..4
  total: number;
  variant: SlideVariant;
  data: SlideData;
  coverImage?: string | null;
  logo?: string | null;
  previewScale?: number;
};

const PAD = 40;
const PAD_LEFT = 64;
const W = 1080;
const H = 1440;

const TEXT_STYLE = {
  letterSpacing: "normal",
  wordSpacing: "normal",
} as const;

const colorsFor = (variant: SlideVariant) => {
  switch (variant) {
    case "cover":
      return { bg: "#0D1B3E", text: "#FFFFFF", muted: "rgba(255,255,255,0.75)", gold: "#C9A84C", decor: "#FFFFFF" };
    case "cover-light":
      return { bg: "#F7F5F0", text: "#0D1B3E", muted: "rgba(13,27,62,0.75)", gold: "#C9A84C", decor: "#0D1B3E" };
    case "cover-gold":
      return { bg: "#C9A84C", text: "#0D1B3E", muted: "rgba(13,27,62,0.8)", gold: "#0D1B3E", decor: "#0D1B3E" };
    case "dark":
      return { bg: "#0D1B3E", text: "#FFFFFF", muted: "rgba(255,255,255,0.75)", gold: "#C9A84C", decor: "#FFFFFF" };
    case "light":
      return { bg: "#F7F5F0", text: "#0D1B3E", muted: "rgba(13,27,62,0.7)", gold: "#C9A84C", decor: "#0D1B3E" };
    case "cta":
      return { bg: "#C9A84C", text: "#0D1B3E", muted: "rgba(13,27,62,0.8)", gold: "#0D1B3E", decor: "#0D1B3E" };
    case "cta-dark":
      return { bg: "#0D1B3E", text: "#FFFFFF", muted: "rgba(255,255,255,0.75)", gold: "#C9A84C", decor: "#FFFFFF" };
    case "cta-light":
      return { bg: "#F7F5F0", text: "#0D1B3E", muted: "rgba(13,27,62,0.7)", gold: "#C9A84C", decor: "#0D1B3E" };
  }
};

export const SlideCanvas = forwardRef<HTMLDivElement, Props>(function SlideCanvas(
  { index, total, variant, data, coverImage, logo, previewScale = 1 },
  ref,
) {
  const c = colorsFor(variant);
  const counter = `${String(index + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}`;
  const decorativeNum = String(index + 1);
  const isCover = variant === "cover" || variant === "cover-light" || variant === "cover-gold";
  const isCta = variant === "cta" || variant === "cta-dark" || variant === "cta-light";
  const isDarkBackground = variant === "cover" || variant === "dark" || variant === "cta-dark";
  const isGoldBg = variant === "cta" || variant === "cover-gold";
  const ctaText = data.cta ? (data.cta.includes("→") ? data.cta : `${data.cta} →`) : "";

  const slideStyle = {
    width: W,
    height: H,
    position: "relative",
    backgroundColor: c.bg,
    color: c.text,
    overflow: "hidden",
    flexShrink: 0,
    fontFamily: "var(--font-sans-brand)",
    "--preview-scale": previewScale,
    transform: "scale(var(--preview-scale))",
    transformOrigin: "top left",
    ...TEXT_STYLE,
  } as CSSProperties;

  const logoStyle = {
    height: 90,
    width: "auto",
    opacity: 1,
    objectFit: "contain",
  } as CSSProperties;

  const renderLogo = (extraStyle?: CSSProperties) => {
    if (!logo) return null;
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        <img
          src={logo}
          alt="logo"
          crossOrigin="anonymous"
          style={{
            ...logoStyle,
            ...extraStyle,
            display: isDarkBackground ? "none" : "block",
          }}
        />
        <img
          src={logo}
          alt="logo"
          crossOrigin="anonymous"
          style={{
            ...logoStyle,
            ...extraStyle,
            filter: "brightness(0) invert(1)",
            display: isDarkBackground ? "block" : "none",
          }}
        />
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className="slide-preview"
      style={slideStyle}
    >
      {/* Cover background image + overlay */}
      {isCover && coverImage && (
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
              background: isDarkBackground
                ? "linear-gradient(180deg, rgba(13,27,62,0.75) 0%, rgba(13,27,62,0.75) 100%)"
                : isGoldBg
                  ? "linear-gradient(180deg, rgba(201,168,76,0.85) 0%, rgba(201,168,76,0.85) 100%)"
                  : "linear-gradient(180deg, rgba(247,245,240,0.85) 0%, rgba(247,245,240,0.85) 100%)",
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
          ...TEXT_STYLE,
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
            ...TEXT_STYLE,
            textTransform: "uppercase",
            color: c.muted,
          }}
        >
          {!isCta ? renderLogo() : <div />}
          <div>{counter}</div>
        </div>

        {/* Middle block: tag, divider, title, body, optional CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 880 }}>
          {data.tag && (
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                ...TEXT_STYLE,
                textTransform: "uppercase",
                color: variant === "light" || variant === "cta" ? c.text : c.gold,
              }}
            >
              {data.tag}
            </div>
          )}
          <div style={{ width: 32, height: 2, backgroundColor: isGoldBg ? "#0D1B3E" : "#C9A84C" }} />
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 96,
              lineHeight: 1.05,
              color: c.text,
              ...TEXT_STYLE,
            }}
          >
            {data.titleLine1 && <div>{data.titleLine1}</div>}
            {data.titleLine2 && (
              <div
                style={{
                  fontStyle: "italic",
                  color: isGoldBg ? "#0D1B3E" : "#C9A84C",
                  ...TEXT_STYLE,
                }}
              >
                {data.titleLine2}
              </div>
            )}
          </div>
          {data.body && (
            <div style={{ fontSize: 32, lineHeight: 1.45, color: c.muted, maxWidth: 820, ...TEXT_STYLE }}>
              {data.body}
            </div>
          )}
          {isCta && data.cta && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  display: "inline-block",
                  width: "fit-content",
                  minWidth: "unset",
                  maxWidth: "fit-content",
                  backgroundColor: variant === "cta" ? "#0D1B3E" : "#C9A84C",
                  color: variant === "cta" ? "#FFFFFF" : "#0D1B3E",
                  padding: "12px 28px",
                  borderRadius: 999,
                  fontSize: 30,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  ...TEXT_STYLE,
                }}
              >
                {ctaText}
              </div>
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
            ...TEXT_STYLE,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                backgroundColor: isGoldBg ? "#0D1B3E" : "#C9A84C",
                display: "inline-block",
              }}
            />
            <div style={TEXT_STYLE}>Lidera Cálculos</div>
          </div>
          {isCover && (
            <div style={{ ...TEXT_STYLE, textTransform: "uppercase" }}>
              arraste →
            </div>
          )}
        </div>
      </div>

      {/* CTA: large centered logo at bottom */}
      {isCta && logo && (
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
          {renderLogo()}
        </div>
      )}
    </div>
  );
});

export const SLIDE_WIDTH = W;
export const SLIDE_HEIGHT = H;