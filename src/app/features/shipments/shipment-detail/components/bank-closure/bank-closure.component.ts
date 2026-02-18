import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

export interface BankClosureModel {
  docsSubmittedToImporterDate: string | null;
  importerStampDate: string | null;
  docsSubmittedToBankDate: string | null;
  formMClosedDate: string | null;
  paymentReleasedDate: string | null;
  bankClosureRemarks: string;
}

@Component({
  selector: 'app-bank-closure',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bank-closure.component.html',
  styleUrl: './bank-closure.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankClosureComponent implements OnInit, OnChanges {
  @Input() initialValue: Partial<BankClosureModel> | null = null;
  @Input() fecdSubmittedToBankDate: string | null = null;
  @Input() disabled = false;
  @Output() save = new EventEmitter<BankClosureModel>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      docsSubmittedToImporterDate: [null as string | null],
      importerStampDate: [null as string | null],
      docsSubmittedToBankDate: [null as string | null],
      formMClosedDate: [null as string | null],
      paymentReleasedDate: [null as string | null],
      bankClosureRemarks: [''],
    });
  }

  ngOnInit(): void {
    if (this.initialValue) {
      this.form.patchValue(this.initialValue);
    }
    if (this.fecdSubmittedToBankDate && !this.form.get('docsSubmittedToBankDate')?.value) {
      this.form.patchValue({ docsSubmittedToBankDate: this.fecdSubmittedToBankDate });
    }
    if (this.disabled) this.form.disable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fecdSubmittedToBankDate'] && this.form && this.fecdSubmittedToBankDate) {
      const current = this.form.get('docsSubmittedToBankDate')?.value;
      if (!current) {
        this.form.patchValue({ docsSubmittedToBankDate: this.fecdSubmittedToBankDate }, { emitEvent: false });
      }
    }
    if (changes['disabled'] && this.form) {
      this.disabled ? this.form.disable() : this.form.enable();
    }
    if (changes['initialValue'] && this.form && this.initialValue) {
      this.form.patchValue(this.initialValue);
    }
  }

  get status(): 'pending' | 'in_progress' | 'completed' {
    const submitted = this.form.get('docsSubmittedToBankDate')?.value;
    const closed = this.form.get('formMClosedDate')?.value;
    const released = this.form.get('paymentReleasedDate')?.value;
    if (released) return 'completed';
    if (closed) return 'in_progress';
    if (submitted) return 'in_progress';
    return 'pending';
  }

  onSave(): void {
    if (this.form.invalid || this.form.disabled) return;
    this.save.emit(this.form.getRawValue() as BankClosureModel);
  }
}
