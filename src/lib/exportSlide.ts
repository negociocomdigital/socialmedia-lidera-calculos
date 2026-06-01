import domtoimage from "dom-to-image-more";

async function getJSZip() {
  const module = await import("jszip");
  return module.default;
}

async function capture(slideElement: HTMLElement): Promise<Blob> {
  if (!slideElement) throw new Error("Slide não encontrado para exportação.");
  await document.fonts?.ready;

  const originalTransform = slideElement.style.transform;
  const originalTransformOrigin = slideElement.style.transformOrigin;
  slideElement.style.transform = "none";
  slideElement.style.transformOrigin = "top left";

  await new Promise((r) => setTimeout(r, 300));

  try {
    const blob: Blob = await domtoimage.toBlob(slideElement, {
      width: 1080,
      height: 1440,
      style: {
        transform: "none",
        transformOrigin: "top left",
      },
      useCORS: true,
      cacheBust: true,
    });
    if (!blob) throw new Error("Falha ao gerar a imagem do slide.");
    return blob;
  } finally {
    slideElement.style.transform = originalTransform;
    slideElement.style.transformOrigin = originalTransformOrigin;
  }
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
  const blob = await capture(slideElement);
  downloadBlob(blob, filename);
}

export async function exportAllSlides(zipName = "lidera-carrossel.zip") {
  const JSZip = await getJSZip();
  const zip = new JSZip();
  const slides = document.querySelectorAll<HTMLElement>(".slide-preview");
  if (!slides.length) throw new Error("Nenhum slide com a classe .slide-preview foi encontrado.");

  for (let i = 0; i < slides.length; i++) {
    const blob = await capture(slides[i]);
    zip.file(`slide-0${i + 1}.png`, blob);
  }

  const zipBlob: Blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipBlob, zipName);
}
