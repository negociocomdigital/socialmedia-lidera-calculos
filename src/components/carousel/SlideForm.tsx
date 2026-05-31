import type { CarouselState, SlideData } from "@/lib/carouselTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useRef } from "react";

type Props = {
  state: CarouselState;
  setState: (updater: (s: CarouselState) => CarouselState) => void;
  onGenerate: () => void;
};

export function SlideForm({ state, setState, onGenerate }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const updateSlide = (i: number, patch: Partial<SlideData>) =>
    setState((s) => ({
      ...s,
      slides: s.slides.map((sl, idx) => (idx === i ? { ...sl, ...patch } : sl)),
    }));

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setState((s) => {
      if (s.coverImage) URL.revokeObjectURL(s.coverImage);
      return { ...s, coverImage: url };
    });
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onGenerate();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="theme">Tema do carrossel</Label>
        <Input
          id="theme"
          placeholder="Ex: Gestão financeira para clínicas"
          value={state.theme}
          onChange={(e) => setState((s) => ({ ...s, theme: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Imagem de capa (slide 1)</Label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <Upload />
            {state.coverImage ? "Trocar imagem" : "Enviar imagem"}
          </Button>
          {state.coverImage && (
            <img
              src={state.coverImage}
              alt="capa"
              className="h-12 w-12 rounded-md object-cover ring-1 ring-border"
            />
          )}
        </div>
      </div>

      <div className="space-y-6">
        {state.slides.map((sl, i) => (
          <fieldset
            key={i}
            className="space-y-3 rounded-lg border border-border p-4"
          >
            <legend className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Slide {String(i + 1).padStart(2, "0")}
            </legend>
            <div className="space-y-2">
              <Label htmlFor={`tag-${i}`}>Tag</Label>
              <Input
                id={`tag-${i}`}
                value={sl.tag}
                onChange={(e) => updateSlide(i, { tag: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="space-y-2">
                <Label htmlFor={`t1-${i}`}>Título — linha 1</Label>
                <Input
                  id={`t1-${i}`}
                  value={sl.titleLine1}
                  onChange={(e) => updateSlide(i, { titleLine1: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`t2-${i}`}>Título — linha 2 (itálico dourado)</Label>
                <Input
                  id={`t2-${i}`}
                  value={sl.titleLine2}
                  onChange={(e) => updateSlide(i, { titleLine2: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`body-${i}`}>Corpo</Label>
              <Textarea
                id={`body-${i}`}
                rows={3}
                value={sl.body}
                onChange={(e) => updateSlide(i, { body: e.target.value })}
              />
            </div>
            {i === 4 && (
              <div className="space-y-2">
                <Label htmlFor={`cta-${i}`}>CTA</Label>
                <Input
                  id={`cta-${i}`}
                  placeholder="Ex: Agendar conversa"
                  value={sl.cta ?? ""}
                  onChange={(e) => updateSlide(i, { cta: e.target.value })}
                />
              </div>
            )}
          </fieldset>
        ))}
      </div>

      <Button type="submit" className="w-full" size="lg">
        Gerar carrossel
      </Button>
    </form>
  );
}