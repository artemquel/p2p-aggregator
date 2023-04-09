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

@Injectable()
export class ExchangeService {
  constructor(
    private readonly byBit: ByBit,
    private readonly binance: Binance,
  ) {}

  public async getOffers(request: Omit<IOfferRequest, 'direction'>) {
    const offers = await Promise.all(
      this.exchanges.map((exchange) =>
        this.getExchangeOffers(request, exchange),
      ),
    );

    return this.exchanges.reduce(
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
    };

    return map[exchange];
  }

  private get exchanges(): EExchange[] {
    return [EExchange.ByBit, EExchange.Binance];
  }
}
