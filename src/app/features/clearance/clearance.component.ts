import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShipmentService } from '../../core/services/shipment.service';
import { Shipment } from '../../shared/models/shipment.model';

@Component({
  selector: 'app-clearance',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './clearance.component.html',
  styleUrl: './clearance.component.css'
})
export class ClearanceComponent implements OnInit {
  shipments: Shipment[] = [];
  selectedShipment?: Shipment;
  paarForm!: FormGroup;

  constructor(
    private shipmentService: ShipmentService,
    private fb: FormBuilder
  ) {
    this.paarForm = this.fb.group({
      paarNumber: ['', Validators.required],
      dutyAmount: [0, [Validators.required, Validators.min(0)]],
      dutyPaid: [false],
      dutyPaymentDate: [''],
      customsRelease: [false],
      customsReleaseDate: [''],
      terminalRelease: [false],
      terminalReleaseDate: ['']
    });
  }

  ngOnInit() {
    this.loadShipments();
  }

  loadShipments() {
    this.shipmentService.getAll().subscribe(shipments => {
      this.shipments = shipments;
    });
  }

  selectShipment(shipment: Shipment) {
    this.selectedShipment = shipment;
    if (shipment.clearance) {
      this.paarForm.patchValue({
        paarNumber: shipment.clearance.paarNumber || '',
        dutyAmount: shipment.clearance.dutyAmount || 0,
        dutyPaid: shipment.clearance.dutyPaid || false,
        dutyPaymentDate: shipment.clearance.dutyPaymentDate ? 
          new Date(shipment.clearance.dutyPaymentDate).toISOString().split('T')[0] : '',
        customsRelease: shipment.clearance.customsRelease || false,
        customsReleaseDate: shipment.clearance.customsReleaseDate ? 
          new Date(shipment.clearance.customsReleaseDate).toISOString().split('T')[0] : '',
        terminalRelease: shipment.clearance.terminalRelease || false,
        terminalReleaseDate: shipment.clearance.terminalReleaseDate ? 
          new Date(shipment.clearance.terminalReleaseDate).toISOString().split('T')[0] : ''
      });
    }
  }

  saveClearance() {
    if (this.paarForm.valid && this.selectedShipment) {
      // In a real app, this would call a service to update clearance
      console.log('Saving clearance:', this.paarForm.value);
      alert('Clearance information saved!');
    }
  }
}

