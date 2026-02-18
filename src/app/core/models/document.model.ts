import type { DocumentType } from '../enums/document-type.enum';

export interface DocumentMetadata {
  id: number;
  shipmentId: number;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: number;
  uploadedAt: string;
  version: number;
  replacedAt: string | null;
}
