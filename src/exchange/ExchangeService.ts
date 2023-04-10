import { ByBit } from './bybit/ByBit';
import { Binance } from './binance/Binance';
import {
  EExchange,
  EOfferDirection,
  IExchange,
  IOfferRequest,
  IOffersResponse,
} from './types';
import { Injectable } from '@nestjs/common';
import { Okx } from './okx/Okx';

@Injectable()
export class ExchangeService {
  constructor(
    private readonly byBit: ByBit,
    private readonly binance: Binance,
    private readonly okx: Okx,
  ) {}

  public async getOffers(request: Omit<IOfferRequest, 'direction'>) {
    const exchanges = Object.values(EExchange);
    const offers = await Promise.all(
      exchanges.map((exchange) => this.getExchangeOffers(request, exchange)),
    );

    return exchanges.reduce(
      (acc, exchange, key) => ({ ...acc, [exchange]: offers[key] }),
      {} as { [key in EExchange]: IOffersResponse },
    );
  }

  private async getExchangeOffers(
    request: Omit<IOfferRequest, 'direction'>,
    exchange: EExchange,
  ): Promise<IOffersResponse> {
    const [buy, sell] = await Promise.all([
      this.exchangeToService(exchange).getOffers({
        ...request,
        direction: EOfferDirection.BUY,
      }),
      this.exchangeToService(exchange).getOffers({
        ...request,
        direction: EOfferDirection.SELL,
      }),
    ]);

    return {
      [EOfferDirection.SELL]: sell,
      [EOfferDirection.BUY]: buy,
    };
  }

  private exchangeToService(exchange: EExchange): IExchange {
    const map = {
      [EExchange.ByBit]: this.byBit,
      [EExchange.Binance]: this.binance,
      [EExchange.Okx]: this.okx,
    };

    return map[exchange];
  }
}
