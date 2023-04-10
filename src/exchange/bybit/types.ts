export enum EByBitPayment {
  Tinkoff = '75',
  QIWI = '62',
  Rosbank = '185',
  Payeer = '51',
  Advcash = '5',
}

export enum EByBitTradeType {
  BUY = '1',
  SELL = '0',
}

export interface IByBitRawRequest {
  currencyId: string;
  tokenId: string;
  side: EByBitTradeType;
  page: string;
  size: string;
  payment?: EByBitPayment[];
  authMaker?: boolean;
  canTrade?: boolean;
  userId?: '';
  amount?: string;
}

export interface IByBitRequest
  extends Omit<
    IByBitRawRequest,
    'userId' | 'page' | 'size' | 'authMaker' | 'canTrade'
  > {}

export interface IByBitOffer {
  tokenId: string;
  currencyId: string;
  side: EByBitTradeType;
  price: string;
  minAmount: string;
  maxAmount: string;
  payments: EByBitPayment[];
}

export interface IByBitResponseResult {
  count: number;
  items: IByBitOffer[];
}

export interface IByBitResponse {
  result: IByBitResponseResult;
}
