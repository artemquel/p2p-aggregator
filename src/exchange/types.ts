export enum EOfferDirection {
  BUY,
  SELL,
}

export interface IOfferRequest {
  fiatUnit: string;
  cryptoUnit: string;
  direction: EOfferDirection;
}

export interface IOffer {
  minAmount: number;
  maxAmount: number;
  price: number;
  payments: string[];
}

export interface IExchange {
  getOffers(request: IOfferRequest): Promise<IOffer[]>;
}

export enum EExchange {
  Binance,
  ByBit,
}
