/**
 * Type declarations for html2pdf.js
 */

declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[]
    filename?: string
    image?: {
      type?: 'jpeg' | 'png' | 'webp'
      quality?: number
    }
    enableLinks?: boolean
    html2canvas?: {
      scale?: number
      useCORS?: boolean
      letterRendering?: boolean
      logging?: boolean
      allowTaint?: boolean
      backgroundColor?: string
      width?: number
      height?: number
      x?: number
      y?: number
      scrollX?: number
      scrollY?: number
      windowWidth?: number
      windowHeight?: number
    }
    jsPDF?: {
      unit?: 'pt' | 'mm' | 'cm' | 'in' | 'px' | 'pc' | 'em' | 'ex'
      format?: string | [number, number]
      orientation?: 'portrait' | 'landscape'
      compress?: boolean
      precision?: number
      putOnlyUsedFonts?: boolean
      hotfixes?: string[]
      encryption?: {
        userPassword?: string
        ownerPassword?: string
        userPermissions?: string[]
      }
      floatPrecision?: number | 'smart'
    }
    pagebreak?: {
      mode?: string | string[]
      before?: string | string[]
      after?: string | string[]
      avoid?: string | string[]
    }
  }

  interface Html2PdfInstance {
    set(opt: Html2PdfOptions): Html2PdfInstance
    from(element: HTMLElement | string): Html2PdfInstance
    save(): Promise<void>
    output(type: 'arraybuffer'): Promise<ArrayBuffer>
    output(type: 'blob'): Promise<Blob>
    output(type: 'datauristring' | 'dataurlstring'): Promise<string>
    output(type: 'datauri' | 'dataurl'): Promise<string>
    output(type: 'pdfobjectnewwindow'): Promise<void>
    output(type: 'pdfjsnewwindow'): Promise<void>
    toPdf(): Html2PdfInstance
    get(type: 'pdf'): Promise<any>
    then(callback: (value: any) => any): Promise<any>
  }

  function html2pdf(): Html2PdfInstance
  function html2pdf(element: HTMLElement | string, options?: Html2PdfOptions): Html2PdfInstance

  export default html2pdf
}


