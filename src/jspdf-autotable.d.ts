declare module 'jspdf-autotable' {
  interface AutoTableOptions {
    startY?: number;
    head?: string[][];
    body?: (string | number)[][];
    theme?: 'striped' | 'grid' | 'plain';
    headStyles?: Record<string, unknown>;
    bodyStyles?: Record<string, unknown>;
    columnStyles?: Record<number, Record<string, unknown>>;
    margin?: { left?: number; right?: number };
  }

  function autoTable(doc: unknown, options: AutoTableOptions): void;

  export default autoTable;
}
