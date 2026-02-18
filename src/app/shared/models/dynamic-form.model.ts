export type FieldType = 'text' | 'number' | 'email' | 'password' | 'select' | 'checkbox' | 'date' | 'textarea';

export interface FieldOption {
  label: string;
  value: any;
}

export interface FieldValidation {
  name: string;
  validator: any;
  message: string;
}

export interface DynamicFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  value?: any;
  options?: FieldOption[];
  validations?: FieldValidation[];
  disabled?: boolean;
  hidden?: boolean;
  placeholder?: string;
  className?: string; // For Bootstrap grid classes like 'col-md-6'
}

export interface DynamicSectionConfig {
  sectionTitle: string;
  fields: DynamicFieldConfig[];
  className?: string;
}
