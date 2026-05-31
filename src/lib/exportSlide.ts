export async function exportSlide(node: HTMLElement, filename: string) {
  const { default: html2canvas } = await import("html2canvas");
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
  await new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));