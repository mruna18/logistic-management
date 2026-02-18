export enum Status {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  DELAYED = 'Delayed'
}

export enum ProductType {
  GENERAL_CARGO = 'General Cargo',
  PERISHABLE = 'Perishable',
  HAZARDOUS = 'Hazardous',
  ELECTRONICS = 'Electronics',
  TEXTILES = 'Textiles',
  MACHINERY = 'Machinery',
  FOOD_ITEMS = 'Food Items'
}

export enum LogisticType {
  IMPORT = 'Import',
  EXPORT = 'Export',
  TRUCKING = 'Trucking'
}

export enum MovementType {
  SEA = 'Sea',
  AIR = 'Air',
  ROAD = 'Road'
}

export enum ServiceScope {
  D2D = 'Door to Door',
  PORT_PORT = 'Port to Port'
}

export enum ClearingType {
  INHOUSE = 'Inhouse',
  THIRD_PARTY = 'Third Party'
}

export enum ContainerType {
  TWENTY_FT = '20ft',
  FORTY_FT = '40ft'
}

export enum PaymentType {
  DUTY = 'Duty',
  FREIGHT = 'Freight',
  HANDLING = 'Handling',
  DEMURRAGE = 'Demurrage',
  STORAGE = 'Storage',
  OTHER = 'Other'
}

