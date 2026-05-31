/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    html2canvas: any;
    JSZip: any;
  }
}

async function waitForLib(name: "html2canvas" | "JSZip", timeoutMs = 8000) {
  const start = Date.now();
  while (!(window as any)[name]) {
    if (Date.now() - start > timeoutMs) throw new Error(`${name} não carregou`);
    await new Promise((r) => setTimeout(r, 50));
  }
  return (window as any)[name];
}

async function capture(slideElement: HTMLElement): Promise<HTMLCanvasElement> {
  const html2canvas = await waitForLib("html2canvas");
  return await html2canvas(slideElement, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    width: slideElement.offsetWidth,
    height: slideElement.offsetHeight,
    logging: false,
  });
}

function downloadFromUrl(url: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportSlide(slideElement: HTMLElement, filename: string) {
  const canvas = await capture(slideElement);
  downloadFromUrl(canvas.toDataURL("image/png"), filename);
}

export async function exportSlidesAsZip(
  _nodes: (HTMLElement | null)[],
  zipName = "lidera-carrossel.zip",
) {
  const JSZip = await waitForLib("JSZip");
  const zip = new JSZip();
  const slides = document.querySelectorAll<HTMLElement>(".slide-preview");
  for (let i = 0; i < slides.length; i++) {
    const canvas = await capture(slides[i]);
    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b: Blob | null) => resolve(b as Blob), "image/png"),
    );
    zip.file(`slide-0${i + 1}.png`, blob);
  }
  const zipBlob: Blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  downloadFromUrl(url, zipName);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));