import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  EBinanceTradeType,
  IBinanceOffer,
  IBinanceRawRequest,
  IBinanceRequest,
  IBinanceResponse,
} from './types';
import { firstValueFrom } from 'rxjs';
import { EOfferDirection, IExchange, IOffer, IOfferRequest } from '../types';

@Injectable()
export class Binance implements IExchange {
  private readonly endpoint =
    'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search';
  private readonly rows = 20;

  constructor(private readonly httpService: HttpService) {}

  public async getOffers(request: IOfferRequest): Promise<IOffer[]> {
    const offers = await this.loadOffers({
      asset: request.cryptoUnit,
      fiat: request.fiatUnit,
      tradeType: this.offerDirectionToTradeType(request.direction),
    });

    return offers.map((offer) => ({
      minAmount: Number(offer.adv.minSingleTransAmount),
      maxAmount: Number(offer.adv.maxSingleTransAmount),
      price: Number(offer.adv.price),
      payments: offer.adv.tradeMethods.map((method) => method.tradeMethodName),
    }));
  }

  private offerDirectionToTradeType(
    offerDirection: EOfferDirection,
  ): EBinanceTradeType {
    const map = {
      [EOfferDirection.SELL]: EBinanceTradeType.SELL,
      [EOfferDirection.BUY]: EBinanceTradeType.BUY,
    };

    return map[offerDirection];
  }

  private async loadOffers(payload: IBinanceRequest): Promise<IBinanceOffer[]> {
    const firstPage = await this.request({
      ...payload,
      page: 1,
    });

    const { total } = firstPage;

    const promises: Promise<IBinanceResponse>[] = [];
    for (let i = 2; i <= Math.ceil(total / this.rows); i++) {
      promises.push(this.request({ ...payload, page: i }));
    }

    const otherPages = await Promise.all(promises).then((result) =>
      result.flatMap(({ data }) => data),
    );

    return [...firstPage.data, ...otherPages];
  }

  private async request(
    payload: Omit<IBinanceRawRequest, 'rows'>,
  ): Promise<IBinanceResponse> {
    const request: IBinanceRawRequest = {
      countries: [],
      payTypes: [],
      publisherType: 'merchant',
      proMerchantAds: false,
      rows: this.rows,
      ...payload,
    };

    const { data } = await firstValueFrom(
      this.httpService.post<IBinanceResponse>(this.endpoint, request),
    );

    return data;
  }
}
