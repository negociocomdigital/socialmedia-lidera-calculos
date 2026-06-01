import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { SlideForm } from "@/components/carousel/SlideForm";
import { SlidePreview } from "@/components/carousel/SlidePreview";
import type { SlideVariant } from "@/components/carousel/SlideCanvas";
import { DEFAULT_STATE, type CarouselState, type SlideData } from "@/lib/carouselTypes";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportAllSlides } from "@/lib/exportSlide";
import logoAsset from "@/assets/logo.png";

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

const VARIANTS_DARK: SlideVariant[] = ["cover", "light", "dark", "light", "cta"];
const VARIANTS_LIGHT: SlideVariant[] = ["cover-light", "dark", "light", "dark", "cta"];
const VARIANTS_GOLD: SlideVariant[] = ["cover-gold", "dark", "light", "dark", "cta-light"];

const SAMPLE_JSON = JSON.stringify(
  {
    tema: "Revisão de Aposentadoria",
    slides: [
      { tag: "Revisão de Aposentadoria", titulo1: "Você pode estar recebendo", titulo2: "menos do que merece.", corpo: "Erros no cálculo do INSS são mais comuns do que parecem. Deslize e descubra." },
      { tag: "O problema", titulo1: "Por que muitos aposentados", titulo2: "recebem menos?", corpo: "Períodos não computados, salários desatualizados e erros na média salarial." },
      { tag: "Seu direito", titulo1: "A revisão pode", titulo2: "aumentar seu benefício.", corpo: "A lei permite revisão quando há erro na concessão. Você tem até 10 anos." },
      { tag: "Como funciona", titulo1: "Nossa análise é técnica,", titulo2: "clara e dentro do prazo.", corpo: "Análise completa do histórico, laudo técnico e atendimento pelo WhatsApp." },
      { tag: "Próximo passo", titulo1: "Solicite sua", titulo2: "análise gratuita agora.", corpo: "Entre em contato pelo WhatsApp. Sem compromisso.", cta: "Falar no WhatsApp →" },
    ],
  },
  null,
  2,
);

function Index() {
  const [state, setState] = useState<CarouselState>(DEFAULT_STATE);
  const [jsonText, setJsonText] = useState<string>(SAMPLE_JSON);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null, null]);
  const [exportingAll, setExportingAll] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const onGenerate = () => {
    let parsed: { tema?: string; slides?: Array<{ tag?: string; titulo1?: string; titulo2?: string; corpo?: string; cta?: string }> };
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setError("JSON inválido. Verifique a formatação.");
      return;
    }
    if (!parsed?.slides || !Array.isArray(parsed.slides) || parsed.slides.length < 5) {
      setError("O JSON precisa conter um array 'slides' com 5 itens.");
      return;
    }
    const slides: SlideData[] = parsed.slides.slice(0, 5).map((s, i) => ({
      tag: s.tag ?? "",
      titleLine1: s.titulo1 ?? "",
      titleLine2: s.titulo2 ?? "",
      body: s.corpo ?? "",
      cta: i === 4 ? s.cta ?? "" : undefined,
    }));
    setError(null);
    setState((s) => ({ ...s, theme: parsed.tema ?? s.theme, slides }));
    requestAnimationFrame(() => {
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const exportAll = async () => {
    setExportingAll(true);
    setExportError(null);
    try {
      const variants =
        state.palette === "light" ? VARIANTS_LIGHT : state.palette === "gold" ? VARIANTS_GOLD : VARIANTS_DARK;
      const configs = state.slides.map((data, i) => ({
        index: i,
        total: 5,
        variant: variants[i],
        data,
        coverImage: i === 0 ? state.coverImage : null,
        logo: state.logo,
      }));
      await exportAllSlides(configs, "lidera-carrossel.zip");
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Não foi possível exportar os slides.");
    } finally {
      setExportingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#0D1B3E]">
      <header className="border-b border-black/10 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-5">
          <img src={logoAsset} alt="Lidera Cálculos" style={{ height: 80, width: "auto" }} />
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
          <SlideForm
            state={state}
            setState={setState}
            jsonText={jsonText}
            setJsonText={setJsonText}
            onGenerate={onGenerate}
            errorMessage={error}
          />
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
              {exportingAll ? "Gerando..." : "Exportar todos os slides"}
            </Button>
          </div>
          {exportingAll && (
            <div className="rounded-lg border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-3 text-sm font-medium text-[#0D1B3E]">
              Gerando slides…
            </div>
          )}
          {exportError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {exportError}
            </div>
          )}
          <div className="grid gap-6 sm:grid-cols-2">
            {state.slides.map((sl, i) => (
              <SlidePreview
                key={i}
                index={i}
                total={5}
                variant={
                  state.palette === "light"
                    ? VARIANTS_LIGHT[i]
                    : state.palette === "gold"
                      ? VARIANTS_GOLD[i]
                      : VARIANTS_DARK[i]
                }
                data={sl}
                coverImage={i === 0 ? state.coverImage : null}
                logo={state.logo}
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
