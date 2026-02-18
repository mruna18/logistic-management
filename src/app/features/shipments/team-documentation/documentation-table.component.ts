import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-documentation-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './documentation-table.component.html'
})
export class DocumentationTableComponent {
  @Input() parentForm!: FormGroup;

  get documentsArray(): FormArray {
    return this.parentForm.get('documents') as FormArray;
  }

  getDocFormGroup(index: number): FormGroup {
    return this.documentsArray.at(index) as FormGroup;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Approved': return 'bg-success';
      case 'Submitted': return 'bg-info';
      case 'Rejected': return 'bg-danger';
      case 'Pending': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }
}
