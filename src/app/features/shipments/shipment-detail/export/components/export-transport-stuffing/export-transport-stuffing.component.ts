import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs';
import type { ExportTransportStuffingModel, ExportContainerModel } from '../../models/export-shipment.model';

const TRANSPORTERS = ['Transporter A', 'Transporter B', 'Transporter C', 'Transporter D'];
const CONTAINER_TYPES = ['20ft', '40ft', 'Reefer'];
const SHIPPING_LINES = ['MSC', 'MAERSK', 'CMA CGM', 'Hapag-Lloyd', 'ONE', 'Evergreen', 'Cosco', 'PIL'];
const MODE_OPTIONS: ('Empty from Yard' | 'Triangulation')[] = ['Empty from Yard', 'Triangulation'];

const EMPTY_CONTAINER: ExportContainerModel = {
  containerNumber: '',
  transporterNames: [],
  allocationDate: null,
  stuffingLocationAddress: '',
  allocationToTransporterDateTime: null,
  mode: 'Empty from Yard',
  truckGatedInEmptyYardDateTime: null,
  emptyLoadedInTerminalDateTime: null,
  emptyGatedOutOfTerminalDateTime: null,
  emptyArrivedAtDeliveryLocationDateTime: null,
  stuffingStartedDateTime: null,
  stuffingCompleteDateTime: null,
  signedWaybillReceivedDateTime: null,
  stuffedGateOutFromWarehouseDateTime: null,
  stuffedGatedInPolLocation: '',
  stuffedGatedInPolDateTime: null,
  eirReceivedDateTime: null,
  waybillEirSubmittedToInvoicingDateTime: null,
  demurrageCharged: false,
  demurrageDays: null,
  demurrageReason: '',
  debitToTransporter: false,
  debitToTransporterReasons: '',
};

@Component({
  selector: 'app-export-transport-stuffing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './export-transport-stuffing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportTransportStuffingComponent implements OnInit, OnChanges {
  @Input() initialValue: Partial<ExportTransportStuffingModel> | null = null;
  @Input() shippingLineFromAbove = '';
  @Input() containerTypeFromAbove = '';
  @Input() disabled = false;
  @Output() save = new EventEmitter<ExportTransportStuffingModel>();

  form!: FormGroup;
  readonly expandedIndex = signal<number | null>(null);
  readonly transporters = TRANSPORTERS;
  readonly containerTypes = CONTAINER_TYPES;
  readonly shippingLines = SHIPPING_LINES;
  readonly modeOptions = MODE_OPTIONS;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
    if (this.initialValue) this.patchValue(this.initialValue);
    if (this.shippingLineFromAbove) this.form.patchValue({ shippingLine: this.shippingLineFromAbove });
    if (this.containerTypeFromAbove) this.form.patchValue({ containerType: this.containerTypeFromAbove });
    this.form.valueChanges
      .pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
      .subscribe(() => this.aggregateFileLevel());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue'] && this.form && changes['initialValue'].currentValue) {
      this.patchValue(changes['initialValue'].currentValue);
    }
    if ((changes['shippingLineFromAbove'] || changes['containerTypeFromAbove']) && this.form) {
      this.form.patchValue({
        shippingLine: this.shippingLineFromAbove || this.form.get('shippingLine')?.value,
        containerType: this.containerTypeFromAbove || this.form.get('containerType')?.value,
      });
    }
    if (changes['disabled'] && this.form) {
      this.disabled ? this.form.disable() : this.form.enable();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      stuffingProjected: [null as string | null],
      shippingLine: [''],
      containerType: [''],
      stuffingAddress: [''],
      transportersAllocated: [[] as string[]],
      firstEmptyLoadedOut: [null as string | null],
      lastEmptyLoadedOut: [null as string | null],
      firstEmptyDeliveredToClient: [null as string | null],
      lastEmptyDeliveredToClient: [null as string | null],
      firstEmptyStuffedAtClient: [null as string | null],
      lastEmptyStuffedAtClient: [null as string | null],
      firstStuffedDepartedFromClient: [null as string | null],
      lastStuffedDepartedFromClient: [null as string | null],
      firstStuffedGatedInPol: [null as string | null],
      lastStuffedGatedInPol: [null as string | null],
      completeWaybillsReceived: [null as string | null],
      completeEirReceived: [null as string | null],
      indemnityApplicable: [false],
      indemnityReceivedDate: [null as string | null],
      docsSubmittedToInvoicingDate: [null as string | null],
      containers: this.fb.array([]),
    });
  }

  private patchValue(v: Partial<ExportTransportStuffingModel>): void {
    this.form.patchValue(v, { emitEvent: false });
    const containers = v?.containers ?? [];
    this.containers.clear();
    containers.forEach((c) => this.containers.push(this.createContainerGroup(c)));
    this.aggregateFileLevel();
  }

  private aggregateFileLevel(): void {
    const arr = this.containers.controls as FormGroup[];
    const extract = (key: string) => (c: FormGroup) => c.get(key)?.value;
    const toDate = (v: string | null) => (v ? new Date(v) : null);
    const minDate = (vals: (string | null)[]) => {
      const parsed = vals.map(toDate).filter((d): d is Date => !!d && !isNaN(d.getTime()));
      return parsed.length ? new Date(Math.min(...parsed.map((d) => d.getTime()))).toISOString().slice(0, 19) : null;
    };
    const maxDate = (vals: (string | null)[]) => {
      const parsed = vals.map(toDate).filter((d): d is Date => !!d && !isNaN(d.getTime()));
      return parsed.length ? new Date(Math.max(...parsed.map((d) => d.getTime()))).toISOString().slice(0, 19) : null;
    };
    this.form.patchValue(
      {
        firstEmptyLoadedOut: minDate(arr.map(extract('emptyGatedOutOfTerminalDateTime'))),
        lastEmptyLoadedOut: maxDate(arr.map(extract('emptyGatedOutOfTerminalDateTime'))),
        firstEmptyDeliveredToClient: minDate(arr.map(extract('emptyArrivedAtDeliveryLocationDateTime'))),
        lastEmptyDeliveredToClient: maxDate(arr.map(extract('emptyArrivedAtDeliveryLocationDateTime'))),
        firstEmptyStuffedAtClient: minDate(arr.map(extract('stuffingCompleteDateTime'))),
        lastEmptyStuffedAtClient: maxDate(arr.map(extract('stuffingCompleteDateTime'))),
        firstStuffedDepartedFromClient: minDate(arr.map(extract('stuffedGateOutFromWarehouseDateTime'))),
        lastStuffedDepartedFromClient: maxDate(arr.map(extract('stuffedGateOutFromWarehouseDateTime'))),
        firstStuffedGatedInPol: minDate(arr.map(extract('stuffedGatedInPolDateTime'))),
        lastStuffedGatedInPol: maxDate(arr.map(extract('stuffedGatedInPolDateTime'))),
        completeWaybillsReceived:
          arr.length && arr.every((c) => c.get('signedWaybillReceivedDateTime')?.value)
            ? maxDate(arr.map(extract('signedWaybillReceivedDateTime')))
            : null,
        completeEirReceived:
          arr.length && arr.every((c) => c.get('eirReceivedDateTime')?.value)
            ? maxDate(arr.map(extract('eirReceivedDateTime')))
            : null,
      },
      { emitEvent: false }
    );
  }

  private createContainerGroup(c?: Partial<ExportContainerModel>): FormGroup {
    const v = { ...EMPTY_CONTAINER, ...c };
    return this.fb.group({
      containerNumber: [v.containerNumber],
      transporterNames: [v.transporterNames ?? []],
      allocationDate: [v.allocationDate],
      stuffingLocationAddress: [v.stuffingLocationAddress],
      allocationToTransporterDateTime: [v.allocationToTransporterDateTime],
      mode: [v.mode],
      truckGatedInEmptyYardDateTime: [v.truckGatedInEmptyYardDateTime],
      emptyLoadedInTerminalDateTime: [v.emptyLoadedInTerminalDateTime],
      emptyGatedOutOfTerminalDateTime: [v.emptyGatedOutOfTerminalDateTime],
      emptyArrivedAtDeliveryLocationDateTime: [v.emptyArrivedAtDeliveryLocationDateTime],
      stuffingStartedDateTime: [v.stuffingStartedDateTime],
      stuffingCompleteDateTime: [v.stuffingCompleteDateTime],
      signedWaybillReceivedDateTime: [v.signedWaybillReceivedDateTime],
      stuffedGateOutFromWarehouseDateTime: [v.stuffedGateOutFromWarehouseDateTime],
      stuffedGatedInPolLocation: [v.stuffedGatedInPolLocation],
      stuffedGatedInPolDateTime: [v.stuffedGatedInPolDateTime],
      eirReceivedDateTime: [v.eirReceivedDateTime],
      waybillEirSubmittedToInvoicingDateTime: [v.waybillEirSubmittedToInvoicingDateTime],
      demurrageCharged: [v.demurrageCharged],
      demurrageDays: [v.demurrageDays],
      demurrageReason: [v.demurrageReason],
      debitToTransporter: [v.debitToTransporter],
      debitToTransporterReasons: [v.debitToTransporterReasons],
    });
  }

  get containers(): FormArray {
    return this.form.get('containers') as FormArray;
  }

  addContainer(): void {
    this.containers.push(this.createContainerGroup());
  }

  removeContainer(i: number): void {
    this.containers.removeAt(i);
    if (this.expandedIndex() === i) this.expandedIndex.set(null);
    else if ((this.expandedIndex() ?? -1) > i) this.expandedIndex.update((x) => (x != null ? x - 1 : null));
  }

  toggleRow(i: number): void {
    this.expandedIndex.update((x) => (x === i ? null : i));
  }

  isExpanded(i: number): boolean {
    return this.expandedIndex() === i;
  }

  onSave(): void {
    if (this.form.invalid || this.form.disabled) return;
    this.aggregateFileLevel();
    this.save.emit(this.form.getRawValue() as ExportTransportStuffingModel);
  }
}
