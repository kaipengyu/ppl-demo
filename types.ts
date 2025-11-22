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
  customerFirstName: string;
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
  amountComparisonSentence: string;
  energyTipSentence: string;
  monthlyComparison: MonthlyComparison;
  // Persona Fields
  personaTitle: string;
  personaDescription: string;
  personaVisualPrompt: string;
}

export interface ParsedResponse {
  data: BillData | null;
  rawText?: string;
}