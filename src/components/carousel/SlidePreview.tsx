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
  registerRef: (node: HTMLDivElement | null) => void;
};

export function SlidePreview({ index, total, variant, data, coverImage, registerRef }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.4);
  const [exporting, setExporting] = useState(false);

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
    if (!slideRef.current) return;
    setExporting(true);
    try {
      await exportSlide(slideRef.current, `lidera-slide-${index + 1}.png`);
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
            transform: `scale(${scale})`,
            transformOrigin: "top left",
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
        {exporting ? "Exportando..." : `Exportar slide ${index + 1}`}
      </Button>
    </div>
  );
}