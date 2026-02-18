export enum Role {
  ADMIN = 'ADMIN',
  MANAGEMENT = 'MANAGEMENT',
  FINANCE = 'FINANCE',
  CLEARING_AGENT = 'CLEARING_AGENT',
  OPERATIONS = 'OPERATIONS',
  TRANSPORT = 'TRANSPORT',
  CLIENT_VIEW = 'CLIENT_VIEW',
}

export const ROLE_LABELS: Record<Role, string> = {
  [Role.ADMIN]: 'Administrator',
  [Role.MANAGEMENT]: 'Management',
  [Role.FINANCE]: 'Finance',
  [Role.CLEARING_AGENT]: 'Clearing Agent',
  [Role.OPERATIONS]: 'Operations',
  [Role.TRANSPORT]: 'Transport',
  [Role.CLIENT_VIEW]: 'Client View',
};
