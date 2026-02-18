export interface Company {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  defaultTerminalId: number | null;
  defaultPortId: number | null;
  regulatoryDefaults: RegulatoryDefaults;
  approvalMatrixId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegulatoryDefaults {
  nafdacRequired: boolean;
  sonRequired: boolean;
  defaultHsCodePrefix: string;
}

export interface Terminal {
  id: number;
  name: string;
  code: string;
  portId: number;
  companyId: number;
}

export interface Port {
  id: number;
  name: string;
  code: string;
  country: string;
}
