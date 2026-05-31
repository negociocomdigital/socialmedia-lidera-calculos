# Gerador de Carrossel — Lidera Cálculos

App de página única: formulário à esquerda, preview ao vivo dos 5 slides à direita, com export individual e em lote para PNG 1080×1440.

## Layout

```
┌─────────────────────────────┬───────────────────────────────┐
│  FORMULÁRIO (scroll)        │  PREVIEW (scroll)             │
│  - Tema do carrossel        │  [Slide 1 escuro c/ foto]     │
│  - Upload capa (slide 1)    │  [Exportar slide]             │
│  - Slide 1: tag,t1,t2,corpo │  [Slide 2 claro]              │
│  - Slide 2..4: idem         │  [Slide 3 escuro]             │
│  - Slide 5: + CTA           │  [Slide 4 claro]              │
│  [Gerar carrossel]          │  [Slide 5 dourado + CTA]      │
│                             │  [Exportar todos]             │
└─────────────────────────────┴───────────────────────────────┘
```

Grid 2 colunas em desktop (`lg:grid-cols-[420px_1fr]`), empilhado no mobile.

## Identidade visual (tokens)

Adicionar em `src/styles.css` como CSS vars + mapear em `@theme inline`:

- `--brand-dark: #0D1B3E`
- `--brand-light: #F7F5F0`
- `--brand-gold: #C9A84C`
- `--brand-white: #FFFFFF`
- Fontes via Google Fonts (`<link>` em `__root.tsx` head): Playfair Display (700, 700 italic) + DM Sans (400, 500, 700)
- Classes utilitárias: `font-display` (Playfair), `font-sans` (DM Sans)

Substituir tema shadcn padrão pelos tokens da marca onde fizer sentido (primary = gold, background = light).

## Estrutura de arquivos

- `src/routes/index.tsx` — página principal com estado e layout 2 colunas
- `src/components/carousel/SlideForm.tsx` — formulário (tema, upload, 5 blocos de slide)
- `src/components/carousel/SlidePreview.tsx` — wrapper que escolhe variante por índice
- `src/components/carousel/slides/SlideDark.tsx` — slides 1, 3 (slide 1 com prop `coverImage`)
- `src/components/carousel/slides/SlideLight.tsx` — slides 2, 4
- `src/components/carousel/slides/SlideCTA.tsx` — slide 5 dourado
- `src/components/carousel/slideShared.tsx` — Tag, Divider, NumeroDecorativo, Contador, Rodapé (reutilizados)
- `src/lib/exportSlide.ts` — captura via html2canvas em 1080×1440 e dispara download
- `src/lib/carouselTypes.ts` — tipos `SlideData`, `CarouselState`

## Estado

Estado único no `index.tsx`:

```ts
type SlideData = { tag: string; titleLine1: string; titleLine2: string; body: string; cta?: string }
type CarouselState = { theme: string; coverImage: string | null; slides: SlideData[] /* 5 itens */ }
```

Preview é totalmente reativo aos campos (atualiza em tempo real conforme digita). O botão "Gerar carrossel" serve como confirmação visual / scroll para o preview no mobile — não há geração assíncrona.

Upload da capa: `URL.createObjectURL` em memória; revogar quando trocar.

## Anatomia de um slide (proporção 3:4)

Container do preview: `aspect-[3/4] w-full` com `padding: 40px` proporcional ao tamanho renderizado. Para garantir export fiel, cada slide recebe um `data-export-root` com dimensões base de 1080×1440 escaladas via CSS `transform: scale(...)` baseado na largura do container; o original a 1080×1440 fica num wrapper offscreen (ou usamos `html2canvas` com `scale` calculado). Decisão: renderizar o slide sempre em 1080×1440 dentro de um wrapper `overflow-hidden` com `transform: scale(previewWidth/1080)` e `transform-origin: top left`, com altura calculada. Isso garante que o preview é a fonte de verdade para export.

Elementos comuns (componentes em `slideShared.tsx`):

- Contador `01/05` topo-esquerdo — DM Sans 14px, uppercase, letter-spacing 0.1em
- Tag topo — DM Sans bold uppercase, letter-spacing 0.1em, dourado em fundos escuros / dark em fundos claros
- Divisor dourado — `div` 32×2 px, `bg-[--brand-gold]`
- Título — Playfair Display Bold, com `titleLine2` em italic + cor dourada
- Corpo — DM Sans Regular
- Número decorativo (1..5) — canto inferior-direito, Playfair, ~600px, `opacity: 0.08`, mesma cor do texto principal
- Rodapé fixo (esquerda): ponto dourado 8px + "Lidera Cálculos" DM Sans
- Slide 1: rodapé-direito adiciona "arraste →" DM Sans

### Variantes

- **Slide 1 (capa com foto)** — `background-image: url(cover)` cobrindo todo o slide; overlay absoluto `background: linear-gradient(180deg, rgba(13,27,62,0.75), rgba(13,27,62,0.75))` (cor sólida com 75%). Texto sobre o overlay. Cor de texto branca, dourados como acentos.
- **Slides 2, 4 (claro)** — fundo `#F7F5F0`, texto `#0D1B3E`, dourado mantém-se.
- **Slide 3 (escuro)** — fundo `#0D1B3E`, texto branco.
- **Slide 5 (CTA dourado)** — fundo `#C9A84C`, texto `#0D1B3E`. Botão pill: `bg-[#0D1B3E] text-white` com seta dourada (`→` ou `lucide ArrowRight` com cor dourada) à direita, padding pill, alinhado abaixo do corpo.

## Export

Dependência nova: `html2canvas` via `bun add html2canvas`.

`exportSlide(node, filename)`:
1. `html2canvas(node, { width: 1080, height: 1440, scale: 1, useCORS: true, backgroundColor: null })`
2. `canvas.toBlob` → cria `<a download>` com `URL.createObjectURL` → clica → revoga.

Como o slide já renderiza em 1080×1440 internamente (com scale visual no preview), capturamos o nó original sem escala. Estratégia: o componente slide expõe um `ref` para o div interno 1080×1440 (antes do scale); `html2canvas` recebe esse ref.

"Exportar todos os slides": loop sequencial com `await` entre cada export para evitar travar a aba; nome `lidera-slide-{n}.png`.

## Fontes e SSR

Adicionar links Google Fonts em `__root.tsx` `head().links`. Tudo client-only é fine; html2canvas só roda no browser — importar dentro do handler do botão (`const { default: html2canvas } = await import('html2canvas')`) para evitar problema de SSR.

## Notas técnicas

- Tipagem strict ok; nenhum server function necessário.
- Sem backend, sem Cloud.
- Imagem de capa fica em memória (object URL); avisar usuário que recarregar perde a imagem (não persistimos).
- Acessibilidade: labels em todos os inputs, `aria-label` nos botões de export.
- Responsivo: em telas <`lg` o preview fica abaixo do formulário.

## Passos de implementação

1. Instalar `html2canvas`.
2. Atualizar `src/styles.css` com tokens da marca e fontes; adicionar Google Fonts no `__root.tsx`.
3. Criar tipos e componentes compartilhados de slide.
4. Criar variantes Dark / Light / CTA / Cover.
5. Criar `SlideForm` com todos os campos.
6. Montar `routes/index.tsx` com estado, layout 2 colunas, render do preview e botões de export.
7. Implementar `exportSlide` + "Exportar todos".
8. Atualizar `<head>` (title, description) para "Gerador de Carrossel — Lidera Cálculos".
