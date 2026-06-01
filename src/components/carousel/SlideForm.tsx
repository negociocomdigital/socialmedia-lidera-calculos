import type { CarouselState } from "@/lib/carouselTypes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon } from "lucide-react";
import { useRef, useState } from "react";

type Props = {
  state: CarouselState;
  setState: (updater: (s: CarouselState) => CarouselState) => void;
  jsonText: string;
  setJsonText: (v: string) => void;
  onGenerate: () => void;
  errorMessage?: string | null;
};

export function SlideForm({ state, setState, jsonText, setJsonText, onGenerate, errorMessage }: Props) {
  const coverRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const onCoverFile = (file: File | undefined) => {
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
        <Label htmlFor="command">Cole o comando aqui</Label>
        <Textarea
          id="command"
          rows={14}
          spellCheck={false}
          className="font-mono text-xs"
          placeholder='{"tema": "...", "slides": [ ... ]}'
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Cole um JSON com <code>tema</code> e 5 <code>slides</code> (tag, titulo1, titulo2, corpo, cta no último).
        </p>
      </div>

      <div className="space-y-2">
        <Label>Começar com:</Label>
        <div className="grid grid-cols-3 gap-3">
          {(["dark", "light", "gold"] as const).map((p) => {
            const selected = state.palette === p;
            const isDark = p === "dark";
            const isGold = p === "gold";
            return (
              <button
                key={p}
                type="button"
                onClick={() => setState((s) => ({ ...s, palette: p }))}
                className="rounded-xl px-4 py-5 text-center text-sm font-semibold transition-all"
                style={{
                  backgroundColor: isDark ? "#0D1B3E" : isGold ? "#C9A84C" : "#F7F5F0",
                  color: isDark ? "#FFFFFF" : "#0D1B3E",
                  border: `2px solid ${selected ? (isGold ? "#0D1B3E" : "#C9A84C") : "transparent"}`,
                  boxShadow: selected ? "0 0 0 1px rgba(201,168,76,0.2)" : "0 0 0 1px rgba(13,27,62,0.1)",
                }}
              >
                {isDark ? "Escuro" : isGold ? "Dourado" : "Claro"}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Imagem de capa (slide 1)</Label>
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onCoverFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => coverRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            onCoverFile(e.dataTransfer.files?.[0]);
          }}
          className={`flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            dragOver
              ? "border-[#C9A84C] bg-[#C9A84C]/10"
              : state.coverImage
                ? "border-[#0D1B3E]/40 bg-white"
                : "border-[#0D1B3E]/30 bg-white/60 hover:border-[#C9A84C] hover:bg-[#C9A84C]/5"
          }`}
        >
          {state.coverImage ? (
            <img
              src={state.coverImage}
              alt="capa"
              className="h-32 w-full rounded-md object-cover"
            />
          ) : (
            <ImageIcon className="h-8 w-8 text-[#0D1B3E]/60" />
          )}
          <span className="text-sm text-[#0D1B3E]/80">
            {state.coverImage
              ? "Clique ou arraste para trocar a foto"
              : "Arraste uma foto para a capa ou clique para enviar"}
          </span>
        </button>
        {errorMessage && (
          <p className="text-sm font-medium text-red-600">{errorMessage}</p>
        )}
      </div>

      <Button type="submit" className="w-full" size="lg">
        Gerar carrossel
      </Button>
    </form>
  );
}