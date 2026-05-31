export type SlideData = {
  tag: string;
  titleLine1: string;
  titleLine2: string;
  body: string;
  cta?: string;
};

export type CarouselState = {
  theme: string;
  coverImage: string | null;
  logo: string | null;
  palette: "dark" | "light" | "gold";
  slides: SlideData[];
};

export const EMPTY_SLIDE: SlideData = {
  tag: "",
  titleLine1: "",
  titleLine2: "",
  body: "",
};

export const DEFAULT_STATE: CarouselState = {
  theme: "",
  coverImage: null,
  logo: null,
  palette: "dark",
  slides: [
    { tag: "Insight", titleLine1: "Decisões financeiras", titleLine2: "com clareza", body: "Um carrossel sobre como cálculos sólidos protegem o seu negócio.", },
    { tag: "Contexto", titleLine1: "O problema", titleLine2: "silencioso", body: "Empresas perdem margem porque não medem onde estão sangrando." },
    { tag: "Diagnóstico", titleLine1: "Onde mora", titleLine2: "o risco", body: "Falta de método transforma planilhas em decisões no escuro." },
    { tag: "Solução", titleLine1: "Método Lidera", titleLine2: "em ação", body: "Cálculos auditados, indicadores claros e relatórios objetivos." },
    { tag: "Próximo passo", titleLine1: "Pronto para", titleLine2: "liderar?", body: "Fale com a Lidera Cálculos e tenha controle sobre seus números.", cta: "Agendar conversa" },
  ],
};