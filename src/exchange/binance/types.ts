export enum EBinanceTradeType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export interface IBinanceRawRequest {
  asset: string;
  fiat: string;
  tradeType: EBinanceTradeType;
  page: number;
  rows: number;
  countries?: string[];
  payTypes?: string[];
  proMerchantAds?: boolean;
  publisherType?: 'merchant';
  transAmount?: number;
}

export interface IBinanceRequest
  extends Omit<
    IBinanceRawRequest,
    'rows' | 'page' | 'publisherType' | 'proMerchantAds'
  > {}

export interface IBinanceTradeMethod {
  tradeMethodName: string;
}

export interface IBinanceAdv {
  advNo: string;
  tradeType: EBinanceTradeType;
  asset: string;
  fiatUnit: string;
  price: string;
  maxSingleTransAmount: string;
  minSingleTransAmount: string;
  tradeMethods: IBinanceTradeMethod[];
}

export interface IBinanceAdvertiser {
  userNo: string;
  monthFinishRate: number;
  monthOrderCount: number;
  proMerchant: boolean;
}

export interface IBinanceOffer {
  adv: IBinanceAdv;
  advertiser: IBinanceAdvertiser;
}

export interface IBinanceResponse {
  data: IBinanceOffer[];
  success: boolean;
  total: number;
}
