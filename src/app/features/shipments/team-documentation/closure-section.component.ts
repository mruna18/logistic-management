import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-closure-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './closure-section.component.html'
})
export class ClosureSectionComponent implements OnInit, OnDestroy {
  @Input() closureForm!: FormGroup;
  private sub: Subscription = new Subscription();

  ngOnInit(): void {
    this.updateFileClosedDateState();
    
    this.sub.add(
      this.closureForm.valueChanges.subscribe(() => {
        this.updateFileClosedDateState();
      })
    );
  }

  private updateFileClosedDateState(): void {
    const { fecdUpdated, eirDate, waybillDate, terminalRefundDate, shippingRefundDate } = this.closureForm.value;
    
    const canClose = fecdUpdated && eirDate && waybillDate && terminalRefundDate && shippingRefundDate;
    
    const fileClosedDateControl = this.closureForm.get('fileClosedDate');
    if (canClose) {
      fileClosedDateControl?.enable({ emitEvent: false });
    } else {
      fileClosedDateControl?.disable({ emitEvent: false });
      fileClosedDateControl?.setValue(null, { emitEvent: false });
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
