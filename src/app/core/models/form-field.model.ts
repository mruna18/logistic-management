export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
  required?: boolean;
  options?: { label: string; value: any }[];
  placeholder?: string;
  visible?: boolean;
  editable?: boolean;
  rolePermissions?: string[];
  className?: string; // Added for layout flexibility
  value?: any; // Default value
}
