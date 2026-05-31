import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { SlideForm } from "@/components/carousel/SlideForm";
import { SlidePreview } from "@/components/carousel/SlidePreview";
import type { SlideVariant } from "@/components/carousel/SlideCanvas";
import { DEFAULT_STATE, type CarouselState } from "@/lib/carouselTypes";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportSlide, wait } from "@/lib/exportSlide";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gerador de Carrossel — Lidera Cálculos" },
      { name: "description", content: "Crie carrosséis editoriais para Instagram com a identidade visual da Lidera Cálculos e exporte em PNG 1080×1440." },
      { property: "og:title", content: "Gerador de Carrossel — Lidera Cálculos" },
      { property: "og:description", content: "Crie carrosséis editoriais para Instagram com a identidade visual da Lidera Cálculos." },
    ],
  }),
  component: Index,
});

const VARIANTS: SlideVariant[] = ["cover", "light", "dark", "light", "cta"];

function Index() {
  const [state, setState] = useState<CarouselState>(DEFAULT_STATE);
  const previewRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null, null]);
  const [exportingAll, setExportingAll] = useState(false);

  const onGenerate = () => {
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const exportAll = async () => {
    setExportingAll(true);
    try {
      for (let i = 0; i < slideRefs.current.length; i++) {
        const node = slideRefs.current[i];
        if (!node) continue;
        await exportSlide(node, `lidera-slide-${i + 1}.png`);
        await wait(200);
      }
    } finally {
      setExportingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#0D1B3E]">
      <header className="border-b border-black/10 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#C9A84C]" />
            <span className="font-display text-xl font-bold tracking-tight">
              Lidera <span className="italic text-[#C9A84C]">Cálculos</span>
            </span>
          </div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#0D1B3E]/60">
            Gerador de Carrossel
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-8 px-6 py-8 lg:grid-cols-[440px_1fr]">
        <section aria-label="Formulário" className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-2">
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold leading-tight">
              Crie seu carrossel
              <span className="block italic text-[#C9A84C]">editorial</span>
            </h1>
            <p className="mt-2 text-sm text-[#0D1B3E]/70">
              Preencha cada slide e veja o preview ao vivo à direita.
            </p>
          </div>
          <SlideForm state={state} setState={setState} onGenerate={onGenerate} />
        </section>

        <section ref={previewRef} aria-label="Preview dos slides" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Preview</h2>
            <Button
              type="button"
              onClick={exportAll}
              disabled={exportingAll}
              className="bg-[#0D1B3E] text-white hover:bg-[#0D1B3E]/90"
            >
              <Download />
              {exportingAll ? "Exportando..." : "Exportar todos os slides"}
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {state.slides.map((sl, i) => (
              <SlidePreview
                key={i}
                index={i}
                total={5}
                variant={VARIANTS[i]}
                data={sl}
                coverImage={i === 0 ? state.coverImage : null}
                registerRef={(n) => {
                  slideRefs.current[i] = n;
                }}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
