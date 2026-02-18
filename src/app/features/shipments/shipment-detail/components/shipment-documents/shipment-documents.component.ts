import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShipmentDocument } from '../../models/shipment-detail.model';

@Component({
  selector: 'app-shipment-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shipment-documents.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentDocumentsComponent {
  @Input() documents: ShipmentDocument[] = [];
  @Input() disabled = false;

  trackByDocId(_index: number, doc: ShipmentDocument): string {
    return doc.id;
  }
}
