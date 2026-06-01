import type { Options as Html2CanvasOptions } from "html2canvas";

async function getHtml2Canvas() {
  const module = await import("html2canvas");
  return module.default;
}

async function getJSZip() {
  const module = await import("jszip");
  return module.default;
}

async function capture(slideElement: HTMLElement): Promise<HTMLCanvasElement> {
  if (!slideElement) throw new Error("Slide não encontrado para exportação.");
  await document.fonts?.ready;
  const html2canvas = await getHtml2Canvas();

  const originalTransform = slideElement.style.transform;
  const originalTransformOrigin = slideElement.style.transformOrigin;
  slideElement.style.transform = "none";
  slideElement.style.transformOrigin = "unset";

  await new Promise((r) => setTimeout(r, 400));

  const options: Partial<Html2CanvasOptions> = {
    scale: 1,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    width: 1080,
    height: 1440,
    windowWidth: 1080,
    windowHeight: 1440,
    scrollX: 0,
    scrollY: 0,
    logging: false,
    imageTimeout: 0,
    ignoreElements: (element) => element.tagName === "STYLE" || element.tagName === "LINK",
    onclone: (clonedDocument) => {
      clonedDocument.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => node.remove());
      clonedDocument.querySelectorAll<HTMLElement>(".slide-preview").forEach((clonedSlide) => {
        clonedSlide.style.width = "1080px";
        clonedSlide.style.height = "1440px";
        clonedSlide.style.transform = "none";
        clonedSlide.style.transformOrigin = "unset";
        clonedSlide.style.fontFamily = "'DM Sans', Arial, sans-serif";
        clonedSlide.style.letterSpacing = "normal";
        clonedSlide.style.wordSpacing = "normal";
        clonedSlide.querySelectorAll<HTMLElement>("*").forEach((node) => {
          const family = node.style.fontFamily;
          if (family.includes("var(--font-display)")) node.style.fontFamily = "'Playfair Display', Georgia, serif";
          if (family.includes("var(--font-sans-brand)")) node.style.fontFamily = "'DM Sans', Arial, sans-serif";
          node.style.letterSpacing = "normal";
          node.style.wordSpacing = "normal";
        });
      });
    },
  };
  try {
    return await html2canvas(slideElement, options);
  } finally {
    slideElement.style.transform = originalTransform;
    slideElement.style.transformOrigin = originalTransformOrigin;
  }
}

async function canvasToBlob(canvas: HTMLCanvasElement) {
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Não foi possível gerar o arquivo PNG."));
    }, "image/png");
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportSlide(slideElement: HTMLElement, filename: string) {
  const canvas = await capture(slideElement);
  const blob = await canvasToBlob(canvas);
  downloadBlob(blob, filename);
}

export async function exportAllSlides(zipName = "lidera-carrossel.zip") {
  const JSZip = await getJSZip();
  const zip = new JSZip();
  const slides = document.querySelectorAll<HTMLElement>(".slide-preview");
  if (!slides.length) throw new Error("Nenhum slide com a classe .slide-preview foi encontrado.");

  for (let i = 0; i < slides.length; i++) {
    const canvas = await capture(slides[i]);
    const blob = await canvasToBlob(canvas);
    zip.file(`slide-0${i + 1}.png`, blob);
  }

  const zipBlob: Blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipBlob, zipName);
}

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));