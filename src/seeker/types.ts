import { EExchange } from '../exchange/types';

export interface ISeekerOpportunity {
  purchasePrice: number;
  purchaseExchange: EExchange;
  sellPrice: number;
  sellExchange: EExchange;
}
