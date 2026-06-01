declare module "dom-to-image-more" {
  export interface DomToImageOptions {
    width?: number;
    height?: number;
    style?: Record<string, string | number>;
    bgcolor?: string;
    quality?: number;
    cacheBust?: boolean;
    useCORS?: boolean;
    filter?: (node: Node) => boolean;
    imagePlaceholder?: string;
    [key: string]: unknown;
  }
  const domtoimage: {
    toBlob(node: Node, options?: DomToImageOptions): Promise<Blob>;
    toPng(node: Node, options?: DomToImageOptions): Promise<string>;
    toJpeg(node: Node, options?: DomToImageOptions): Promise<string>;
    toSvg(node: Node, options?: DomToImageOptions): Promise<string>;
    toPixelData(node: Node, options?: DomToImageOptions): Promise<Uint8ClampedArray>;
  };
  export default domtoimage;
}
