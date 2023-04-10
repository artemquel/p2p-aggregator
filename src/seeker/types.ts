import { EExchange } from '../exchange/types';

export type TAmounts = [number, number];

export interface ISeekerOpportunity {
  purchasePrice: number;
  purchaseExchange: EExchange;
  purchaseAmounts: TAmounts;
  sellPrice: number;
  sellExchange: EExchange;
  sellAmounts: TAmounts;
  profit: number;
  profitPercent: number;
}
