import { EExchange, EPaymentType } from '../exchange/types';

export type TAmounts = [number, number];

export interface ISeekerOpportunity {
  purchasePrice: number;
  purchaseExchange: EExchange;
  purchaseAmounts: TAmounts;
  purchasePaymentType: EPaymentType[];
  sellPrice: number;
  sellExchange: EExchange;
  sellAmounts: TAmounts;
  sellPaymentType: EPaymentType[];
  profit: number;
  profitPercent: number;
}
