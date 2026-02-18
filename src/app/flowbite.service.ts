import { Injectable } from '@angular/core';

declare var require: any;

@Injectable({
  providedIn: 'root'
})
export class FlowbiteService {

  constructor() { }

  loadFlowbite(callback: (flowbite: any) => void) {
    if (typeof window !== 'undefined') {
      import('flowbite').then(flowbite => {
        callback(flowbite);
      });
    }
  }
}
