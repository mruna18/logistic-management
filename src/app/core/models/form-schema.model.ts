import { FormField } from './form-field.model';

export interface FormSection {
  sectionTitle: string;
  fields: FormField[];
}

export interface FormSchema {
  sections: FormSection[];
  companyId?: string;
  moduleId?: string;
}
