import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import {
  PerformanceControlStage,
  ResponsibleParty,
  createEmptyPerformanceStages,
  calculateDelayDays,
} from '../../../../../core/models/performance-control-matrix.model';

const RESPONSIBLE_PARTIES: ResponsibleParty[] = [
  'Importer',
  'ADB',
  'Exporter',
  'Clearing Agent',
  'Shipping Line',
  'Transporter',
  'Terminal',
  'Customs',
];

@Component({
  selector: 'app-performance-control-matrix',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './performance-control-matrix.component.html',
  styleUrl: './performance-control-matrix.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerformanceControlMatrixComponent implements OnInit, OnChanges {
  @Input() initialValue: PerformanceControlStage[] | null = null;
  @Input() shipmentData: {
    formMApprovedDate?: string | null;
    originDetails?: { atd?: string | null; etd?: string | null } | null;
    preArrival?: { paarReceivedDate?: string | null; dutyPaidDate?: string | null; eta?: string | null } | null;
    terminalShipping?: { ata?: string | null; tdoReceived?: string | null; examinationDone?: string | null } | null;
    customsRegulatory?: { customReleaseDate?: string | null } | null;
    transportDelivery?: {
      firstContainerLoadedOut?: string | null;
      lastContainerDelivered?: string | null;
    } | null;
  } | null = null;
  @Input() disabled = false;
  @Output() save = new EventEmitter<PerformanceControlStage[]>();

  form!: FormGroup;
  readonly responsibleParties = RESPONSIBLE_PARTIES;
  readonly phases = [1, 2, 3, 4, 5, 6];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
    if (this.initialValue?.length) {
      this.patchStages(this.initialValue);
    } else {
      this.patchFromShipmentData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['shipmentData'] && this.form && this.shipmentData) {
      this.syncActualDatesFromShipment();
    }
    if (changes['initialValue'] && this.form && changes['initialValue'].currentValue) {
      this.patchStages(changes['initialValue'].currentValue);
    }
    if (changes['disabled'] && this.form) {
      this.disabled ? this.form.disable() : this.form.enable();
    }
  }

  private buildForm(): void {
    const stagesArray = createEmptyPerformanceStages().map(s =>
      this.fb.group({
        id: [s.id],
        stageName: [s.stageName],
        phaseNumber: [s.phaseNumber],
        plannedDate: [s.plannedDate],
        actualDate: [s.actualDate],
        delayDays: [{ value: s.delayDays, disabled: true }],
        responsibleParty: [s.responsibleParty],
        remarks: [s.remarks],
      })
    );
    this.form = this.fb.group({ stages: this.fb.array(stagesArray) });
    this.registerDelayCalculators();
  }

  private registerDelayCalculators(): void {
    this.stages.controls.forEach((_, i) => {
      this.stages.at(i).get('plannedDate')?.valueChanges.subscribe(() => this.recalculateDelay(i));
      this.stages.at(i).get('actualDate')?.valueChanges.subscribe(() => this.recalculateDelay(i));
    });
  }

  private recalculateDelay(index: number): void {
    const ctrl = this.stages.at(index);
    const planned = ctrl.get('plannedDate')?.value;
    const actual = ctrl.get('actualDate')?.value;
    const delay = calculateDelayDays(planned, actual);
    ctrl.get('delayDays')?.setValue(delay, { emitEvent: false });
  }

  private patchStages(stages: PerformanceControlStage[]): void {
    stages.forEach((s, i) => {
      const ctrl = this.stages.at(i);
      if (ctrl && s.id === ctrl.get('id')?.value) {
        ctrl.patchValue({
          plannedDate: s.plannedDate,
          actualDate: s.actualDate,
          responsibleParty: s.responsibleParty,
          remarks: s.remarks,
        });
        this.recalculateDelay(i);
      }
    });
  }

  private patchFromShipmentData(): void {
    const d = this.shipmentData;
    if (!d) return;
    const stageMap: Record<string, string | null | undefined> = {
      formM_approval: d.formMApprovedDate,
      production_shipment: d.originDetails?.atd ?? d.originDetails?.etd,
      paar_application: d.preArrival?.paarReceivedDate,
      duty_payment: d.preArrival?.dutyPaidDate,
      vessel_arrival: d.preArrival?.eta ?? d.terminalShipping?.ata,
      inspection: d.terminalShipping?.examinationDone,
      customs_release: d.customsRegulatory?.customReleaseDate,
      tdo_issued: d.terminalShipping?.tdoReceived,
      container_gate_out: d.transportDelivery?.firstContainerLoadedOut,
      warehouse_delivery: d.transportDelivery?.lastContainerDelivered,
    };
    this.stages.controls.forEach((ctrl, i) => {
      const id = ctrl.get('id')?.value;
      const val = stageMap[id];
      if (val && !ctrl.get('actualDate')?.value) {
        ctrl.patchValue({ actualDate: val }, { emitEvent: false });
        this.recalculateDelay(i);
      }
    });
  }

  private syncActualDatesFromShipment(): void {
    this.patchFromShipmentData();
  }

  get stages(): FormArray {
    return this.form.get('stages') as FormArray;
  }

  getStagesByPhase(phase: number): { ctrl: FormGroup; index: number }[] {
    return this.stages.controls
      .map((c, i) => ({ ctrl: c as FormGroup, index: i }))
      .filter(({ ctrl }) => ctrl.get('phaseNumber')?.value === phase);
  }

  getDelayBadgeClass(delay: number | null | undefined): string {
    if (delay == null) return 'bg-secondary';
    if (delay > 0) return 'bg-danger';
    if (delay === 0) return 'bg-success';
    return 'bg-info';
  }

  onSave(): void {
    const raw = this.stages.getRawValue();
    const payload: PerformanceControlStage[] = raw.map((r: Record<string, unknown>) => ({
      id: r['id'] as PerformanceControlStage['id'],
      stageName: r['stageName'] as string,
      phaseNumber: r['phaseNumber'] as 1 | 2 | 3 | 4 | 5 | 6,
      plannedDate: r['plannedDate'] as string | null,
      actualDate: r['actualDate'] as string | null,
      delayDays: r['delayDays'] as number | null,
      responsibleParty: r['responsibleParty'] as ResponsibleParty | null,
      remarks: (r['remarks'] as string) || '',
    }));
    this.save.emit(payload);
  }

  getPhaseLabel(phase: number): string {
    const labels: Record<number, string> = {
      1: 'Phase 1: Pre-Shipment (Form M)',
      2: 'Phase 2: Shipment & Export',
      3: 'Phase 3: PAAR',
      4: 'Phase 4: Port & Customs',
      5: 'Phase 5: Delivery & Empty Return',
      6: 'Phase 6: Bank Closure',
    };
    return labels[phase] ?? `Phase ${phase}`;
  }
}
