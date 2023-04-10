export enum EPaymentType {
  Tinkoff,
  Rosbank,
  Qiwi,
  Payeer,
  Advcash,
}

export enum EOfferDirection {
  BUY,
  SELL,
}

export interface IOfferRequest {
  fiatUnit: string;
  cryptoUnit: string;
  direction: EOfferDirection;
  paymentTypes?: EPaymentType[];
}

export interface IOffer {
  minAmount: number;
  maxAmount: number;
  price: number;
  payments: EPaymentType[];
}

export interface IOffersResponse {
  [EOfferDirection.BUY]: IOffer[];
  [EOfferDirection.SELL]: IOffer[];
}

export interface IExchange {
  getOffers(request: IOfferRequest): Promise<IOffer[]>;
}

export enum EExchange {
  Binance = 'Binance',
  ByBit = 'ByBit',
}
