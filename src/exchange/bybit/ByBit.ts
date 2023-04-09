import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  EByBitTradeType,
  IByBitOffer,
  IByBitRawRequest,
  IByBitRequest,
  IByBitResponse,
} from './types';
import { firstValueFrom } from 'rxjs';
import { EOfferDirection, IExchange, IOffer, IOfferRequest } from '../types';

@Injectable()
export class ByBit implements IExchange {
  private readonly endpoint = 'https://api2.bybit.com/fiat/otc/item/online';
  private readonly size = '50';

  constructor(private readonly httpService: HttpService) {}

  public async getOffers(request: IOfferRequest): Promise<IOffer[]> {
    const offers = await this.loadOffers({
      tokenId: request.cryptoUnit,
      currencyId: request.fiatUnit,
      side: this.offerDirectionToTradeType(request.direction),
    });

    return offers.map((offer) => ({
      minAmount: Number(offer.minAmount),
      maxAmount: Number(offer.maxAmount),
      price: Number(offer.price),
      payments: offer.payments.map((method) => String(method)),
    }));
  }

  private offerDirectionToTradeType(
    offerDirection: EOfferDirection,
  ): EByBitTradeType {
    const map = {
      [EOfferDirection.SELL]: EByBitTradeType.SELL,
      [EOfferDirection.BUY]: EByBitTradeType.BUY,
    };

    return map[offerDirection];
  }

  private async loadOffers(payload: IByBitRequest): Promise<IByBitOffer[]> {
    const firstPage = await this.request({
      ...payload,
      page: '1',
    });

    const { count } = firstPage.result;

    const promises: Promise<IByBitResponse>[] = [];
    for (let i = 2; i <= Math.ceil(Number(count) / Number(this.size)); i++) {
      promises.push(this.request({ ...payload, page: String(i) }));
    }

    const otherPages = await Promise.all(promises).then((result) =>
      result.flatMap(({ result }) => result.items),
    );

    return [...firstPage.result.items, ...otherPages];
  }

  private async request(
    payload: Omit<IByBitRawRequest, 'size'>,
  ): Promise<IByBitResponse> {
    const request: IByBitRawRequest = {
      payment: [],
      size: this.size,
      userId: '',
      authMaker: false,
      canTrade: false,
      ...payload,
    };

    const { data } = await firstValueFrom(
      this.httpService.post<IByBitResponse>(this.endpoint, request, {
        headers: { Connection: 'keep-alive' },
      }),
    );

    return data;
  }
}
