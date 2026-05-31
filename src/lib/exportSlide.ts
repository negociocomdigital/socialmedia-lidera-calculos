const HTML2CANVAS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
const JSZIP_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.dataset.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

type Html2Canvas = (
  el: HTMLElement,
  opts?: Record<string, unknown>,
) => Promise<HTMLCanvasElement>;

async function getHtml2Canvas(): Promise<Html2Canvas> {
  await loadScript(HTML2CANVAS_URL);
  const fn = (window as unknown as { html2canvas?: Html2Canvas }).html2canvas;
  if (!fn) throw new Error("html2canvas indisponível");
  return fn;
}

type JSZipCtor = new () => {
  file: (name: string, data: Blob) => void;
  generateAsync: (opts: { type: "blob" }) => Promise<Blob>;
};

async function getJSZip(): Promise<JSZipCtor> {
  await loadScript(JSZIP_URL);
  const Z = (window as unknown as { JSZip?: JSZipCtor }).JSZip;
  if (!Z) throw new Error("JSZip indisponível");
  return Z;
}

async function captureBlob(node: HTMLElement): Promise<Blob> {
  const html2canvas = await getHtml2Canvas();
  const canvas = await html2canvas(node, {
    width: 1080,
    height: 1440,
    windowWidth: 1080,
    windowHeight: 1440,
    scale: 1,
    useCORS: true,
    backgroundColor: null,
    logging: false,
  });
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportSlide(node: HTMLElement, filename: string) {
  const blob = await captureBlob(node);
  triggerDownload(blob, filename);
}

export async function exportSlidesAsZip(
  nodes: (HTMLElement | null)[],
  zipName = "lidera-carrossel.zip",
) {
  const Zip = await getJSZip();
  const zip = new Zip();
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (!n) continue;
    const blob = await captureBlob(n);
    zip.file(`slide-${String(i + 1).padStart(2, "0")}.png`, blob);
  }
  const out = await zip.generateAsync({ type: "blob" });
  triggerDownload(out, zipName);
}

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));