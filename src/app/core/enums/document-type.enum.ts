export enum DocumentType {
  FORM_M = 'FORM_M',
  PAAR = 'PAAR',
  BL = 'BL',
  INVOICE = 'INVOICE',
  PACKING_LIST = 'PACKING_LIST',
  NAFDAC = 'NAFDAC',
  SON = 'SON',
  EIR = 'EIR',
  WAYBILL = 'WAYBILL',
  FECD = 'FECD',
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  [DocumentType.FORM_M]: 'Form M',
  [DocumentType.PAAR]: 'PAAR',
  [DocumentType.BL]: 'Bill of Lading',
  [DocumentType.INVOICE]: 'Invoice',
  [DocumentType.PACKING_LIST]: 'Packing List',
  [DocumentType.NAFDAC]: 'NAFDAC',
  [DocumentType.SON]: 'SON',
  [DocumentType.EIR]: 'EIR',
  [DocumentType.WAYBILL]: 'Waybill',
  [DocumentType.FECD]: 'FECD',
};
