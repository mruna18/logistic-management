import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ImportOrder } from '../../shared/models/import-order.model';
import { Shipment } from '../../shared/models/shipment.model';
import { Container } from '../../shared/models/container.model';
import { 
  ProductType, 
  LogisticType, 
  MovementType, 
  ServiceScope, 
  ClearingType, 
  Status, 
  ContainerType 
} from '../../shared/enums/status.enum';
import { JobType, FileStatus, ShipmentMode } from '../../shared/enums/import-process.enum';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  
  generateImportOrders(): ImportOrder[] {
    const orders: ImportOrder[] = [];
    const productTypes = Object.values(ProductType);
    const logisticTypes = Object.values(LogisticType);
    const movementTypes = Object.values(MovementType);
    const serviceScopes = Object.values(ServiceScope);
    const clearingTypes = Object.values(ClearingType);
    const statuses = Object.values(Status);
    const jobTypes = Object.values(JobType);
    const fileStatuses = Object.values(FileStatus);
    const shipmentModes = Object.values(ShipmentMode);
    const buyers = ['Magnifico Synergies Ltd', 'Acme Industries Ltd', 'Nigerian Petro Corp', 'Lagos Trading Co', 'West Africa Imports'];
    const suppliers = ['Supplier A', 'Supplier B', 'Supplier C', 'Global Trade Co', 'Ocean Freight Ltd'];
    const containerTypes = ['20ft', '40ft', '40ft High Cube', 'Reefer', '20ft Dry Storage'];

    for (let i = 1; i <= 60; i++) {
      const allocationDate = new Date();
      allocationDate.setDate(allocationDate.getDate() - Math.floor(Math.random() * 90));
      const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
      const isExport = jobType === JobType.EXPORT;
      const orderRef = isExport ? `CLE-EXP-2026-${String(i).padStart(3, '0')}` : `ORD-2024-${String(i).padStart(3, '0')}`;

      orders.push({
        id: i.toString(),
        orderReference: orderRef,
        jobType,
        buyerName: buyers[Math.floor(Math.random() * buyers.length)],
        supplierName: suppliers[Math.floor(Math.random() * suppliers.length)],
        fileStatus: fileStatuses[Math.floor(Math.random() * Math.min(4, fileStatuses.length))],
        pfiNumber: `PFI-2026-${String(i).padStart(4, '0')}`,
        containerType: containerTypes[Math.floor(Math.random() * containerTypes.length)],
        productDescription: productTypes[Math.floor(Math.random() * productTypes.length)] + ' - Various grades',
        productType: productTypes[Math.floor(Math.random() * productTypes.length)],
        logisticType: logisticTypes[Math.floor(Math.random() * logisticTypes.length)],
        movementType: movementTypes[Math.floor(Math.random() * movementTypes.length)],
        serviceScope: serviceScopes[Math.floor(Math.random() * serviceScopes.length)],
        containerCount: Math.floor(Math.random() * 5) + 1,
        containerDescription: `Container shipment ${i} - Various goods`,
        clearingType: clearingTypes[Math.floor(Math.random() * clearingTypes.length)],
        shipmentMode: shipmentModes[Math.floor(Math.random() * shipmentModes.length)],
        allocationDate: allocationDate,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: new Date(allocationDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      });
    }
    return orders;
  }

  generateShipments(): Shipment[] {
    const shipments: Shipment[] = [];
    const vessels = ['MV Atlantic Star', 'MV Pacific Express', 'MV Indian Ocean', 'MV Mediterranean', 'MV Red Sea'];
    const ports = ['Shanghai Port', 'Singapore Port', 'Dubai Port', 'Rotterdam Port', 'Los Angeles Port'];
    const countries = ['China', 'Singapore', 'UAE', 'Netherlands', 'USA'];
    const productTypes = Object.values(ProductType);
    const serviceScopes = Object.values(ServiceScope);
    const statuses = Object.values(Status);

    for (let i = 1; i <= 55; i++) {
      const etd = new Date();
      etd.setDate(etd.getDate() - Math.floor(Math.random() * 60));
      const eta = new Date(etd);
      eta.setDate(eta.getDate() + Math.floor(Math.random() * 30) + 15);
      
      shipments.push({
        id: i.toString(),
        orderReference: `ORD-2024-${String(i).padStart(3, '0')}`,
        shipmentReference: `SHIP-2024-${String(i).padStart(3, '0')}`,
        productType: productTypes[Math.floor(Math.random() * productTypes.length)],
        serviceScope: serviceScopes[Math.floor(Math.random() * serviceScopes.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        origin: {
          port: ports[Math.floor(Math.random() * ports.length)],
          country: countries[Math.floor(Math.random() * countries.length)],
          etd: etd,
          actualDeparture: Math.random() > 0.3 ? new Date(etd.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000) : undefined
        },
        transit: {
          vessel: vessels[Math.floor(Math.random() * vessels.length)],
          voyage: `V${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
          estimatedArrival: eta,
          actualArrival: Math.random() > 0.4 ? new Date(eta.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000) : undefined,
          currentLocation: Math.random() > 0.5 ? 'Indian Ocean' : undefined
        },
        clearance: {
          paarNumber: Math.random() > 0.3 ? `PAAR-2024-${String(i).padStart(3, '0')}` : undefined,
          dutyAmount: Math.random() > 0.3 ? Math.floor(Math.random() * 5000000) + 1000000 : undefined,
          dutyPaid: Math.random() > 0.5,
          dutyPaymentDate: Math.random() > 0.5 ? new Date() : undefined,
          customsRelease: Math.random() > 0.6,
          customsReleaseDate: Math.random() > 0.6 ? new Date() : undefined,
          terminalRelease: Math.random() > 0.7,
          terminalReleaseDate: Math.random() > 0.7 ? new Date() : undefined
        },
        containers: [],
        delivery: {
          deliveryAddress: `Lagos Warehouse ${i}, Ikeja`,
          delivered: Math.random() > 0.7,
          deliveryDate: Math.random() > 0.7 ? new Date() : undefined,
          deliveryNotes: Math.random() > 0.5 ? 'Delivered successfully' : undefined
        },
        finance: {
          totalCost: Math.floor(Math.random() * 10000000) + 2000000,
          payments: []
        },
        documents: [
          {
            id: `${i}-1`,
            name: 'Bill of Lading',
            type: 'BL',
            uploadDate: new Date()
          }
        ],
        history: [
          {
            id: `${i}-1`,
            action: 'Shipment Created',
            description: 'Shipment created',
            timestamp: new Date(),
            user: 'Admin'
          }
        ],
        createdAt: new Date(etd.getTime() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      });
    }
    return shipments;
  }

  generateContainers(): Container[] {
    const containers: Container[] = [];
    const types = [ContainerType.TWENTY_FT, ContainerType.FORTY_FT];
    const statuses = Object.values(Status);

    for (let i = 1; i <= 70; i++) {
      const arrivalDate = new Date();
      arrivalDate.setDate(arrivalDate.getDate() - Math.floor(Math.random() * 45));
      const freeDays = 7;
      const daysSinceArrival = Math.floor((new Date().getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
      const demurrageDays = Math.max(0, daysSinceArrival - freeDays);
      const demurrage = demurrageDays * 50000; // 50k per day
      
      containers.push({
        id: i.toString(),
        containerNo: `CONT-${String(i).padStart(4, '0')}`,
        type: types[Math.floor(Math.random() * types.length)] as any,
        sealNo: `SEAL-${String(i).padStart(4, '0')}`,
        arrivalDate: arrivalDate,
        freeDays: freeDays,
        gateOutDate: Math.random() > 0.4 ? new Date(arrivalDate.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000) : undefined,
        emptyReturn: Math.random() > 0.6 ? new Date() : undefined,
        demurrage: demurrage,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        shipmentId: Math.floor(Math.random() * 55 + 1).toString()
      });
    }
    return containers;
  }

  getImportOrders(): Observable<ImportOrder[]> {
    return of(this.generateImportOrders());
  }

  getShipments(): Observable<Shipment[]> {
    return of(this.generateShipments());
  }

  getContainers(): Observable<Container[]> {
    return of(this.generateContainers());
  }
}

