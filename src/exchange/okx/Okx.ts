import {
  EOfferDirection,
  EPaymentType,
  IExchange,
  IOffer,
  IOfferRequest,
} from '../types';
import {
  EOkxPayment,
  EOkxTradeType,
  IOkxOffer,
  IOkxRawRequest,
  IOkxRequest,
  IOkxRequestWithMultiplePayments,
  IOkxResponse,
} from './types';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Okx implements IExchange {
  private readonly endpoint =
    'https://www.okx.com/v3/c2c/tradingOrders/getMarketplaceAdsPrelogin';
  private readonly rows = 50;

  constructor(private readonly httpService: HttpService) {}

  public async getOffers(request: IOfferRequest): Promise<IOffer[]> {
    const offers = await this.loadOffersByPaymentMethods({
      side: this.offerDirectionToTradeType(request.direction),
      fiatCurrency: request.fiatUnit,
      cryptoCurrency: request.cryptoUnit,
      paymentMethod: request.paymentTypes.map(this.mapToLocalPaymentType),
    });

    return offers
      .map((offer) => ({
        minAmount: Number(offer.quoteMinAmountPerOrder),
        maxAmount: Number(offer.quoteMaxAmountPerOrder),
        price: Number(offer.price),
        payments: offer.paymentMethods
          .map(this.mapToPublicPaymentType)
          .filter((method) => !!method),
      }))
      .filter((offer) => offer.payments.length);
  }

  private async loadOffersByPaymentMethods(
    payload: IOkxRequestWithMultiplePayments,
  ): Promise<IOkxOffer[]> {
    if (!payload.paymentMethod.length) {
      payload.paymentMethod = Object.values(EOkxPayment);
    }

    const promises: Promise<IOkxOffer[]>[] = [];

    for (const paymentMethod of payload.paymentMethod) {
      promises.push(this.loadOffers({ ...payload, paymentMethod }));
    }

    return await Promise.all(promises).then((result) =>
      Object.values(
        result.flat().reduce(
          (acc, curr) => ({
            ...acc,
            [curr.id]: curr,
          }),
          {},
        ),
      ),
    );
  }

  private async loadOffers(payload: IOkxRequest): Promise<IOkxOffer[]> {
    const firstPage = await this.request({
      ...payload,
      currentPage: 1,
    });

    const { total } = firstPage.data;

    const promises: Promise<IOkxResponse>[] = [];

    for (let i = 2; i <= Math.ceil(total / this.rows); i++) {
      promises.push(this.request({ ...payload, currentPage: i }));
    }

    const otherPages = await Promise.all(promises).then((result) =>
      result.flatMap(({ data }) => data[payload.side]),
    );

    return [...firstPage.data[payload.side], ...otherPages];
  }

  private async request(
    payload: Omit<IOkxRawRequest, 'numberPerPage'>,
  ): Promise<IOkxResponse> {
    const request: IOkxRawRequest = {
      userTypes: 'all',
      hideOverseasVerificationAds: false,
      sortType: 'price_asc',
      numberPerPage: this.rows,
      ...payload,
      paymentMethod: payload.paymentMethod || EOkxPayment.ALL,
    };

    const { data } = await firstValueFrom(
      this.httpService.get<IOkxResponse>(this.endpoint, { params: request }),
    );

    return data;
  }

  private offerDirectionToTradeType(
    offerDirection: EOfferDirection,
  ): EOkxTradeType {
    const map = {
      [EOfferDirection.SELL]: EOkxTradeType.SELL,
      [EOfferDirection.BUY]: EOkxTradeType.BUY,
    };

    return map[offerDirection];
  }

  private mapToLocalPaymentType(paymentType: EPaymentType): EOkxPayment {
    const map = {
      [EPaymentType.Rosbank]: EOkxPayment.Rosbank,
      [EPaymentType.Payeer]: EOkxPayment.Payeer,
      [EPaymentType.Qiwi]: EOkxPayment.Qiwi,
      [EPaymentType.Advcash]: EOkxPayment.Advcash,
      [EPaymentType.Tinkoff]: EOkxPayment.Tinkoff,
    };

    return map[paymentType];
  }

  private mapToPublicPaymentType(paymentType: EOkxPayment): EPaymentType {
    const map = {
      [EOkxPayment.Rosbank]: EPaymentType.Rosbank,
      [EOkxPayment.Payeer]: EPaymentType.Payeer,
      [EOkxPayment.Qiwi]: EPaymentType.Qiwi,
      [EOkxPayment.Advcash]: EPaymentType.Advcash,
      [EOkxPayment.Tinkoff]: EPaymentType.Tinkoff,
    };

    return map[paymentType];
  }
}
