declare module 'pdf-parse' {
    interface PDFData {
      numpages: number;
      numrender: number;
      info: Record<string, any>;
      metadata: Record<string, any> | null;
      text: string;
      version: string;
    }
  
    function PDFParse(
      dataBuffer: Buffer | Uint8Array,
      options?: {
        pagerender?: (pageData: any) => string;
        max?: number;
        version?: string;
      }
    ): Promise<PDFData>;
  
    export = PDFParse;
  }