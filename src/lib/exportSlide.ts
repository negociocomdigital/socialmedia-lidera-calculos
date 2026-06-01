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

  await new Promise((r) => setTimeout(r, 200));

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
    onclone: (clonedDocument) => {
      // Remove apenas stylesheets que contêm oklch (quebra o parser do html2canvas).
      // Mantém Google Fonts (Playfair Display / DM Sans) para fidelidade tipográfica.
      clonedDocument.querySelectorAll<HTMLLinkElement>("link[rel='stylesheet']").forEach((link) => {
        if (!/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(link.href)) {
          link.remove();
        }
      });
      clonedDocument.querySelectorAll<HTMLStyleElement>("style").forEach((styleNode) => {
        if (styleNode.textContent && /oklch\(/i.test(styleNode.textContent)) {
          styleNode.remove();
        }
      });

      // Reinjeta as CSS vars de fonte que vinham do styles.css removido.
      const fallbackVars = clonedDocument.createElement("style");
      fallbackVars.textContent = `
        :root{
          --font-display:"Playfair Display",Georgia,serif;
          --font-sans-brand:"DM Sans",ui-sans-serif,system-ui,sans-serif;
        }
        .slide-preview,.slide-preview *{
          word-spacing:normal;
          letter-spacing:normal;
        }
      `;
      clonedDocument.head.appendChild(fallbackVars);

      // Garante que o slide renderiza no tamanho real, sem o scale do preview.
      clonedDocument.querySelectorAll<HTMLElement>(".slide-preview").forEach((clonedSlide) => {
        clonedSlide.style.width = "1080px";
        clonedSlide.style.height = "1440px";
        clonedSlide.style.transform = "none";
        clonedSlide.style.transformOrigin = "unset";
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