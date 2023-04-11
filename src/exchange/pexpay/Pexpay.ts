import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  EPexpayPayment,
  EPexpayTradeType,
  IPexpayOffer,
  IPexpayRawRequest,
  IPexpayRequest,
  IPexpayResponse,
} from './types';
import { firstValueFrom } from 'rxjs';
import {
  EOfferDirection,
  EPaymentType,
  IExchange,
  IOffer,
  IOfferRequest,
} from '../types';

@Injectable()
export class Pexpay implements IExchange {
  private readonly endpoint =
    'https://www.pexpay.com/bapi/c2c/v1/friendly/c2c/ad/search';
  private readonly rows = 20;

  constructor(private readonly httpService: HttpService) {}

  public async getOffers(request: IOfferRequest): Promise<IOffer[]> {
    const offers = await this.loadOffers({
      asset: request.cryptoUnit,
      fiat: request.fiatUnit,
      tradeType: this.offerDirectionToTradeType(request.direction),
      payTypes: request.paymentTypes.map(this.mapToLocalPaymentType),
    });

    return offers
      .map((offer) => ({
        minAmount: Number(offer.adDetailResp.minSingleTransAmount),
        maxAmount: Number(offer.adDetailResp.maxSingleTransAmount),
        price: Number(offer.adDetailResp.price),
        payments: offer.adDetailResp.tradeMethods
          .map((method) => this.mapToPublicPaymentType(method.identifier))
          .filter((method) => !!method),
      }))
      .filter((offer) => offer.payments.length);
  }

  private offerDirectionToTradeType(
    offerDirection: EOfferDirection,
  ): EPexpayTradeType {
    const map = {
      [EOfferDirection.SELL]: EPexpayTradeType.SELL,
      [EOfferDirection.BUY]: EPexpayTradeType.BUY,
    };

    return map[offerDirection];
  }

  private async loadOffers(payload: IPexpayRequest): Promise<IPexpayOffer[]> {
    const firstPage = await this.request({
      ...payload,
      page: 1,
    });

    const { total } = firstPage;

    const promises: Promise<IPexpayResponse>[] = [];
    for (let i = 2; i <= Math.ceil(total / this.rows); i++) {
      promises.push(this.request({ ...payload, page: i }));
    }

    const otherPages = await Promise.all(promises).then((result) =>
      result.flatMap(({ data }) => data),
    );

    return [...firstPage.data, ...otherPages];
  }

  private async request(
    payload: Omit<IPexpayRawRequest, 'rows'>,
  ): Promise<IPexpayResponse> {
    const request: IPexpayRawRequest = {
      countries: [],
      rows: this.rows,
      ...payload,
      payTypes: payload.payTypes.length
        ? payload.payTypes
        : Object.values(EPexpayPayment),
    };

    const { data } = await firstValueFrom(
      this.httpService.post<IPexpayResponse>(this.endpoint, request),
    );

    return data;
  }

  private mapToLocalPaymentType(paymentType: EPaymentType): EPexpayPayment {
    const map = {
      [EPaymentType.Rosbank]: EPexpayPayment.Rosbank,
      [EPaymentType.Payeer]: EPexpayPayment.Payeer,
      [EPaymentType.Qiwi]: EPexpayPayment.Qiwi,
      [EPaymentType.Advcash]: EPexpayPayment.Advcash,
      [EPaymentType.Tinkoff]: EPexpayPayment.Tinkoff,
    };

    return map[paymentType];
  }

  private mapToPublicPaymentType(paymentType: EPexpayPayment): EPaymentType {
    const map = {
      [EPexpayPayment.Rosbank]: EPaymentType.Rosbank,
      [EPexpayPayment.Payeer]: EPaymentType.Payeer,
      [EPexpayPayment.Qiwi]: EPaymentType.Qiwi,
      [EPexpayPayment.Advcash]: EPaymentType.Advcash,
      [EPexpayPayment.Tinkoff]: EPaymentType.Tinkoff,
    };

    return map[paymentType];
  }
}
