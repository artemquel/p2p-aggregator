export enum EPexpayPayment {
  Tinkoff = 'Tinkoff',
  Rosbank = 'RosBank',
  Qiwi = 'QIWI',
  Payeer = 'Payeer',
  Advcash = 'Advcash',
}

export enum EPexpayTradeType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export interface IPexpayRawRequest {
  asset: string;
  fiat: string;
  tradeType: EPexpayTradeType;
  page: number;
  rows: number;
  countries?: string[];
  payTypes?: EPexpayPayment[];
  transAmount?: string;
}

export interface IPexpayRequest
  extends Omit<IPexpayRawRequest, 'rows' | 'page'> {}

export interface IPexpayTradeMethod {
  identifier: EPexpayPayment;
}

export interface IPexpayAdv {
  advNo: string;
  tradeType: EPexpayTradeType;
  asset: string;
  fiatCurrency: string;
  price: string;
  maxSingleTransAmount: string;
  minSingleTransAmount: string;
  tradeMethods: IPexpayTradeMethod[];
}

export interface IPexpayAdvertiser {
  userNo: string;
  monthFinishRate: number;
  monthOrderCount: number;
  proMerchant: boolean;
}

export interface IPexpayOffer {
  adDetailResp: IPexpayAdv;
  advertiserVo: IPexpayAdvertiser;
}

export interface IPexpayResponse {
  data: IPexpayOffer[];
  success: boolean;
  total: number;
}
