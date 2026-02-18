import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DocumentMetadata } from '../models/document.model';
import { DocumentType } from '../enums/document-type.enum';

@Injectable({
  providedIn: 'root',
})
export class DocumentMockService {
  private documentsByShipment = new Map<number, DocumentMetadata[]>();

  getDocuments(shipmentId: number): Observable<DocumentMetadata[]> {
    const docs = this.documentsByShipment.get(shipmentId) ?? [];
    return of([...docs]);
  }

  upload(shipmentId: number, type: DocumentType, fileName: string): Observable<DocumentMetadata> {
    const meta: DocumentMetadata = {
      id: Date.now(),
      shipmentId,
      type,
      fileName,
      fileSize: 0,
      mimeType: 'application/pdf',
      uploadedBy: 1,
      uploadedAt: new Date().toISOString(),
      version: 1,
      replacedAt: null,
    };

    const list = this.documentsByShipment.get(shipmentId) ?? [];
    const existing = list.find((d) => d.type === type);
    if (existing) {
      existing.fileName = fileName;
      existing.uploadedAt = meta.uploadedAt;
      existing.version += 1;
      existing.replacedAt = meta.uploadedAt;
      return of(existing);
    }
    list.push(meta);
    this.documentsByShipment.set(shipmentId, list);
    return of(meta);
  }

  replace(shipmentId: number, docId: number, fileName: string): Observable<DocumentMetadata | null> {
    const list = this.documentsByShipment.get(shipmentId) ?? [];
    const doc = list.find((d) => d.id === docId);
    if (!doc) return of(null);

    doc.fileName = fileName;
    doc.uploadedAt = new Date().toISOString();
    doc.version += 1;
    doc.replacedAt = doc.uploadedAt;
    return of(doc);
  }
}
