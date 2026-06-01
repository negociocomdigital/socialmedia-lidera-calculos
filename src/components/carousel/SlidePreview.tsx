import { useEffect, useRef, useState } from "react";
import { SlideCanvas, SLIDE_HEIGHT, SLIDE_WIDTH, type SlideVariant } from "./SlideCanvas";
import type { SlideData } from "@/lib/carouselTypes";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportSlide } from "@/lib/exportSlide";

type Props = {
  index: number;
  total: number;
  variant: SlideVariant;
  data: SlideData;
  coverImage?: string | null;
  logo?: string | null;
  registerRef: (node: HTMLDivElement | null) => void;
};

export function SlidePreview({ index, total, variant, data, coverImage, logo, registerRef }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.4);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setScale(w / SLIDE_WIDTH);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      await exportSlide(
        { index, total, variant, data, coverImage, logo },
        `slide-0${index + 1}.png`,
      );
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Não foi possível exportar este slide.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5"
        style={{ aspectRatio: `${SLIDE_WIDTH} / ${SLIDE_HEIGHT}` }}
      >
        <div
          style={{
            width: SLIDE_WIDTH,
            height: SLIDE_HEIGHT,
          }}
        >
          <SlideCanvas
            ref={(n) => {
              slideRef.current = n;
              registerRef(n);
            }}
            index={index}
            total={total}
            variant={variant}
            data={data}
            coverImage={coverImage}
            logo={logo}
            previewScale={scale}
          />
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={onExport}
        disabled={exporting}
      >
        <Download />
        {exporting ? "Gerando..." : `Exportar slide ${index + 1}`}
      </Button>
      {exportError && <p className="text-sm font-medium text-red-600">{exportError}</p>}
    </div>
  );
}