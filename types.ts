export interface MonthlyComparison {
  month: string;
  labelPreviousYear: string;
  labelCurrentYear: string;
  usagePrevious: number;
  usageCurrent: number;
  tempPrevious: number;
  tempCurrent: number;
  dailyCostPrevious: number;
  dailyCostCurrent: number;
}

export interface BillData {
  customerName: string;
  serviceAddress: string;
  meterNumber: string;
  accountNumber: string;
  amountDue: number;
  dueDate: string;
  supplyCharges: number;
  deliveryCharges: number;
  energyTip: string;
  priceToCompare: number;
  billMonth: string;
  monthlyComparison: MonthlyComparison;
}

export interface ParsedResponse {
  data: BillData | null;
  rawText?: string;
}