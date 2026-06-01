import type { SlideData } from "@/lib/carouselTypes";
import type { SlideVariant } from "@/components/carousel/SlideCanvas";

const W = 1080;
const H = 1440;
const PAD = 40;
const PAD_LEFT = 64;
const TITLE_MAX_WIDTH = 880;
const BODY_MAX_WIDTH = 820;
const TOP_ROW_HEIGHT = 90;
const FOOTER_HEIGHT = 28;
const MIDDLE_GAP = 28;
const FONT_DISPLAY = `"Playfair Display", Georgia, serif`;
const FONT_SANS = `"DM Sans", ui-sans-serif, system-ui, sans-serif`;

export type RenderConfig = {
  index: number;
  total: number;
  variant: SlideVariant;
  data: SlideData;
  coverImage?: string | null;
  logo?: string | null;
};

type Palette = {
  bg: string;
  text: string;
  muted: string;
  gold: string;
  decor: string;
};

function colorsFor(variant: SlideVariant): Palette {
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
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Falha ao carregar imagem: ${src} (${String(e)})`));
    img.src = src;
  });
}

function tintImage(img: HTMLImageElement, w: number, h: number, color: string): HTMLCanvasElement {
  const off = document.createElement("canvas");
  off.width = Math.max(1, Math.round(w));
  off.height = Math.max(1, Math.round(h));
  const ctx = off.getContext("2d")!;
  ctx.drawImage(img, 0, 0, off.width, off.height);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, off.width, off.height);
  return off;
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const targetRatio = W / H;
  const imgRatio = iw / ih;
  let sx = 0, sy = 0, sw = iw, sh = ih;
  if (imgRatio > targetRatio) {
    sw = ih * targetRatio;
    sx = (iw - sw) / 2;
  } else {
    sh = iw / targetRatio;
    sy = (ih - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const lines = getWrappedLines(ctx, text, maxWidth);
  let curY = y;
  for (const line of lines) {
    ctx.fillText(line, x, curY);
    curY += lineHeight;
  }
  return curY;
}

function getWrappedLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
      continue;
    }
    if (line) lines.push(line);
    if (ctx.measureText(word).width <= maxWidth) {
      line = word;
    } else {
      let chunk = "";
      for (const char of Array.from(word)) {
        const next = chunk + char;
        if (ctx.measureText(next).width > maxWidth && chunk) {
          lines.push(chunk);
          chunk = char;
        } else {
          chunk = next;
        }
      }
      line = chunk;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const lines = getWrappedLines(ctx, text, maxWidth);
  let curY = y;
  for (const line of lines) {
    ctx.fillText(line, x, curY);
    curY += lineHeight;
  }
  return curY;
}

function measureMiddleBlockHeight(ctx: CanvasRenderingContext2D, data: SlideData, isCta: boolean): number {
  const titleLineH = 96 * 1.05;
  const bodyLineH = 32 * 1.45;
  const children: number[] = [];

  if (data.tag) children.push(32);
  children.push(2);

  let titleHeight = 0;
  ctx.font = `700 96px ${FONT_DISPLAY}`;
  if (data.titleLine1) titleHeight += getWrappedLines(ctx, data.titleLine1, TITLE_MAX_WIDTH).length * titleLineH;
  ctx.font = `italic 700 96px ${FONT_DISPLAY}`;
  if (data.titleLine2) titleHeight += getWrappedLines(ctx, data.titleLine2, TITLE_MAX_WIDTH).length * titleLineH;
  if (titleHeight) children.push(titleHeight);

  ctx.font = `400 32px ${FONT_SANS}`;
  if (data.body) children.push(getWrappedLines(ctx, data.body, BODY_MAX_WIDTH).length * bodyLineH);

  if (isCta && data.cta) children.push(16 + 30 + 12 * 2);

  const gaps = Math.max(0, children.length - 1) * MIDDLE_GAP;
  return children.reduce((sum, height) => sum + height, 0) + gaps;
}

function getMiddleBlockY(ctx: CanvasRenderingContext2D, data: SlideData, isCta: boolean): number {
  const innerHeight = H - PAD * 2;
  const middleHeight = measureMiddleBlockHeight(ctx, data, isCta);
  const freeSpace = innerHeight - TOP_ROW_HEIGHT - middleHeight - FOOTER_HEIGHT;
  return PAD + TOP_ROW_HEIGHT + Math.max(0, freeSpace / 2);
}

async function ensureFontsReady() {
  if (!document.fonts) return;
  await document.fonts.ready;
  // Force-load the specific weights/styles we need
  try {
    await Promise.all([
      document.fonts.load(`700 96px "Playfair Display"`),
      document.fonts.load(`italic 700 96px "Playfair Display"`),
      document.fonts.load(`700 720px "Playfair Display"`),
      document.fonts.load(`700 26px "DM Sans"`),
      document.fonts.load(`400 32px "DM Sans"`),
      document.fonts.load(`500 30px "DM Sans"`),
      document.fonts.load(`400 22px "DM Sans"`),
      document.fonts.load(`400 24px "DM Sans"`),
    ]);
  } catch {
    /* ignore */
  }
}

export async function renderSlideToCanvas(cfg: RenderConfig): Promise<HTMLCanvasElement> {
  await ensureFontsReady();

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "top";

  const c = colorsFor(cfg.variant);
  const { variant, data, index, total, coverImage, logo } = cfg;
  const isCover = variant === "cover" || variant === "cover-light" || variant === "cover-gold";
  const isCta = variant === "cta" || variant === "cta-dark" || variant === "cta-light";
  const isDarkBg = variant === "cover" || variant === "dark" || variant === "cta-dark";
  const isGoldBg = variant === "cta" || variant === "cover-gold";

  // 1. Background
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, W, H);

  if (isCover && coverImage) {
    try {
      const img = await loadImage(coverImage);
      drawCover(ctx, img);
      // Overlay
      ctx.fillStyle = isDarkBg
        ? "rgba(13,27,62,0.75)"
        : isGoldBg
          ? "rgba(201,168,76,0.85)"
          : "rgba(247,245,240,0.85)";
      ctx.fillRect(0, 0, W, H);
    } catch {
      /* fall back to flat background */
    }
  }

  // 2. Decorative number (huge, off-canvas right/bottom, opacity 0.08)
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = c.decor;
  ctx.font = `700 720px ${FONT_DISPLAY}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  // DOM: right: -40, bottom: -120, font-size 720, line-height 1
  // => box right edge at x = W + 40, box top edge at y = H + 120 - 720 = H - 600
  ctx.fillText(String(index + 1), W + 40, H - 600);
  ctx.restore();
  ctx.textBaseline = "top";

  // Prepare logo variants
  let logoImg: HTMLImageElement | null = null;
  if (logo) {
    try {
      logoImg = await loadImage(logo);
    } catch {
      logoImg = null;
    }
  }
  const drawLogo = (x: number, y: number, height: number, align: "left" | "center" = "left") => {
    if (!logoImg) return;
    const ratio = logoImg.naturalWidth / logoImg.naturalHeight;
    const w = height * ratio;
    const drawX = align === "center" ? x - w / 2 : x;
    const mode: "normal" | "white" | "navy" = isGoldBg ? "navy" : isDarkBg ? "white" : "normal";
    if (mode === "normal") {
      ctx.drawImage(logoImg, drawX, y, w, height);
    } else if (mode === "white") {
      const tinted = tintImage(logoImg, w * 2, height * 2, "#FFFFFF");
      ctx.drawImage(tinted, drawX, y, w, height);
    } else {
      const tinted = tintImage(logoImg, w * 2, height * 2, "#0D1B3E");
      ctx.drawImage(tinted, drawX, y, w, height);
    }
  };

  // 3. Top row: logo (left, not for CTA) + counter (right)
  if (!isCta) {
    drawLogo(PAD_LEFT, PAD, 90);
  }
  ctx.font = `400 22px ${FONT_SANS}`;
  ctx.fillStyle = c.muted;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const counter = `${String(index + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}`;
  ctx.fillText(counter.toUpperCase(), W - PAD, PAD + 45);

  // 4. Middle block — position so it sits roughly centered
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  let y = 560;

  if (data.tag) {
    ctx.font = `700 26px ${FONT_SANS}`;
    ctx.fillStyle = variant === "light" || variant === "cta" ? c.text : c.gold;
    ctx.fillText(data.tag.toUpperCase(), PAD_LEFT, y);
    y += 32 + 28;
  }

  // Divider
  ctx.fillStyle = isGoldBg ? "#0D1B3E" : "#C9A84C";
  ctx.fillRect(PAD_LEFT, y, 32, 2);
  y += 2 + 28;

  // Title
  const titleLineH = 96 * 1.05;
  if (data.titleLine1) {
    ctx.font = `700 96px ${FONT_DISPLAY}`;
    ctx.fillStyle = c.text;
    y = drawWrappedText(ctx, data.titleLine1, PAD_LEFT, y, TITLE_MAX_WIDTH, titleLineH);
  }
  if (data.titleLine2) {
    ctx.font = `italic 700 96px ${FONT_DISPLAY}`;
    ctx.fillStyle = isGoldBg ? "#0D1B3E" : "#C9A84C";
    y = drawWrappedText(ctx, data.titleLine2, PAD_LEFT, y, TITLE_MAX_WIDTH, titleLineH);
  }
  y += 28;

  // Body
  if (data.body) {
    ctx.font = `400 32px ${FONT_SANS}`;
    ctx.fillStyle = c.muted;
    y = wrapText(ctx, data.body, PAD_LEFT, y, BODY_MAX_WIDTH, 32 * 1.45);
  }

  // CTA pill
  if (isCta && data.cta) {
    const ctaText = data.cta.includes("→") ? data.cta : `${data.cta} →`;
    y += 16;
    ctx.font = `500 30px ${FONT_SANS}`;
    const padX = 28;
    const padY = 12;
    const textW = ctx.measureText(ctaText).width;
    const pillH = 30 + padY * 2;
    const pillW = textW + padX * 2;
    const pillX = PAD_LEFT;
    const pillY = y;
    const radius = pillH / 2;
    ctx.fillStyle = variant === "cta" ? "#0D1B3E" : "#C9A84C";
    ctx.beginPath();
    ctx.moveTo(pillX + radius, pillY);
    ctx.arcTo(pillX + pillW, pillY, pillX + pillW, pillY + pillH, radius);
    ctx.arcTo(pillX + pillW, pillY + pillH, pillX, pillY + pillH, radius);
    ctx.arcTo(pillX, pillY + pillH, pillX, pillY, radius);
    ctx.arcTo(pillX, pillY, pillX + pillW, pillY, radius);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = variant === "cta" ? "#FFFFFF" : "#0D1B3E";
    ctx.textBaseline = "middle";
    ctx.fillText(ctaText, pillX + padX, pillY + pillH / 2);
    ctx.textBaseline = "top";
  }

  // 5. CTA: big centered logo near bottom
  if (isCta && logoImg) {
    drawLogo(W / 2, H - PAD - 60 - 90, 90, "center");
  }

  // 6. Footer
  const footerY = H - PAD - 12;
  // Left: dot + "Lidera Cálculos"
  ctx.fillStyle = isGoldBg ? "#0D1B3E" : "#C9A84C";
  ctx.beginPath();
  ctx.arc(PAD_LEFT + 5, footerY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = `400 24px ${FONT_SANS}`;
  ctx.fillStyle = c.muted;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText("Lidera Cálculos", PAD_LEFT + 24, footerY);

  if (isCover) {
    ctx.textAlign = "right";
    ctx.fillText("ARRASTE →", W - PAD, footerY);
  }

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao gerar PNG."))), "image/png");
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportSlide(cfg: RenderConfig, filename: string) {
  const canvas = await renderSlideToCanvas(cfg);
  const blob = await canvasToBlob(canvas);
  downloadBlob(blob, filename);
}

export async function exportAllSlides(configs: RenderConfig[], zipName = "lidera-carrossel.zip") {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  for (let i = 0; i < configs.length; i++) {
    const canvas = await renderSlideToCanvas(configs[i]);
    const blob = await canvasToBlob(canvas);
    zip.file(`slide-0${i + 1}.png`, blob);
  }
  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipBlob, zipName);
}
