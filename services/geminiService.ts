import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BillData } from "../types";

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

const billSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    customerName: { type: Type.STRING, description: "Name of the customer (e.g. NATALIE WESTRING)" },
    serviceAddress: { type: Type.STRING, description: "Service address including city, state, zip" },
    meterNumber: { type: Type.STRING, description: "Meter number listed on the bill" },
    accountNumber: { type: Type.STRING, description: "Account number" },
    amountDue: { type: Type.NUMBER, description: "Total amount due" },
    dueDate: { type: Type.STRING, description: "Due date of the bill" },
    supplyCharges: { type: Type.NUMBER, description: "Total supply charges in dollars" },
    deliveryCharges: { type: Type.NUMBER, description: "Total delivery charges in dollars" },
    energyTip: { type: Type.STRING, description: "The 'Want to save?' energy tip text provided on the bill" },
    priceToCompare: { type: Type.NUMBER, description: "The PPL Electric Utilities Price to Compare rate per kWh" },
    billMonth: { type: Type.STRING, description: "The current month shown in the usage summary/comparison section (e.g. November)" },
    monthlyComparison: {
      type: Type.OBJECT,
      description: "Data from the comparison table showing usage, temp, and cost for two years",
      properties: {
        month: { type: Type.STRING, description: "The month name for the comparison (e.g. November)" },
        labelPreviousYear: { type: Type.STRING, description: "The year label for the previous period column (e.g. 2024)" },
        labelCurrentYear: { type: Type.STRING, description: "The year label for the current period column (e.g. 2025)" },
        usagePrevious: { type: Type.NUMBER, description: "Electricity Usage (kWh) for the previous year" },
        usageCurrent: { type: Type.NUMBER, description: "Electricity Usage (kWh) for the current year" },
        tempPrevious: { type: Type.NUMBER, description: "Avg. Temperature for the previous year" },
        tempCurrent: { type: Type.NUMBER, description: "Avg. Temperature for the current year" },
        dailyCostPrevious: { type: Type.NUMBER, description: "Avg. Daily Cost for the previous year" },
        dailyCostCurrent: { type: Type.NUMBER, description: "Avg. Daily Cost for the current year" },
      },
      required: ["month", "labelPreviousYear", "labelCurrentYear", "usagePrevious", "usageCurrent", "tempPrevious", "tempCurrent", "dailyCostPrevious", "dailyCostCurrent"]
    }
  },
  required: ["customerName", "serviceAddress", "meterNumber", "accountNumber", "amountDue", "dueDate", "supplyCharges", "deliveryCharges", "energyTip", "priceToCompare", "billMonth", "monthlyComparison"]
};

export const analyzeBill = async (base64Pdf: string): Promise<BillData> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Pdf,
            },
          },
          {
            text: `Analyze this electric bill PDF and extract the following specific data points into a JSON structure:
            1. Name (Customer Name)
            2. Address (Service Address)
            3. Meter Number
            4. Account Number
            5. Amount Due
            6. Due Date
            7. Supply $ (Total Supply Charges)
            8. Delivery $ (Total Delivery Charges)
            9. "Want to save?" energy tip text
            10. PPL Electric Utilities price to compare (rate)
            11. Current Month (e.g. November)
            12. Comparison data for the current month including:
                - Electricity Usage for both years (e.g. 2024 and 2025)
                - Average Temperature for both years
                - Average Daily Cost for both years`
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: billSchema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as BillData;
    }
    throw new Error("No data extracted");
  } catch (error) {
    console.error("Error analyzing bill:", error);
    throw error;
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};
