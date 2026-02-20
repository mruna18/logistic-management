/** Mock data for Reporting & Analytics - Production-ready structure */

export const MOCK_CLIENTS = [
  'Magnifico Synergies Ltd',
  'Acme Industries Ltd',
  'Nigerian Petro Corp',
  'Lagos Trading Co',
  'West Africa Imports',
  'Delta Freight Ltd',
  'Port Harcourt Logistics',
];

export const MOCK_TERMINALS = ['Tincan', 'Apapa', 'Onne', 'Calabar', 'Warri'];

export const MOCK_SHIPPING_LINES = ['MSC', 'MAERSK', 'CMA CGM', 'COSCO', 'Hapag-Lloyd', 'ONE'];

export const MOCK_CLEARING_AGENTS = ['Agent A', 'Agent B', 'Agent C', 'In-house'];

export const MOCK_CONTAINER_TYPES = ['20ft', '40ft', '40ft HC', 'Reefer'];

export function randomIn<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  return d;
}
