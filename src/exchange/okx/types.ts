export enum EOkxTradeType {
  BUY = 'buy',
  SELL = 'sell',
}

export enum EOkxPayment {
  Tinkoff = 'Tinkoff',
  Rosbank = 'Rosbank',
  Qiwi = 'QiWi',
  Payeer = 'Payeer',
  Advcash = 'AdvCash',

  ALL = 'all',
}

export interface IOkxRawRequest {
  side: EOkxTradeType;
  paymentMethod: EOkxPayment;
  cryptoCurrency: string;
  fiatCurrency: string;
  currentPage: number;
  numberPerPage: number;
  userTypes?: 'all';
  hideOverseasVerificationAds?: false;
  sortType?: 'price_asc';
}

export interface IOkxRequest
  extends Omit<
    IOkxRawRequest,
    | 'userTypes'
    | 'hideOverseasVerificationAds'
    | 'sortType'
    | 'numberPerPage'
    | 'currentPage'
  > {}

export interface IOkxRequestWithMultiplePayments
  extends Omit<IOkxRequest, 'paymentMethod'> {
  paymentMethod: EOkxPayment[];
}

export interface IOkxOffer {
  id: string;
  price: string;
  quoteMinAmountPerOrder: string;
  quoteMaxAmountPerOrder: string;
  paymentMethods: EOkxPayment[];
}

export interface IOkxResponse {
  data: {
    [EOkxTradeType.BUY]: IOkxOffer[];
    [EOkxTradeType.SELL]: IOkxOffer[];
    total: number;
  };
}
