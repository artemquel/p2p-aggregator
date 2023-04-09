import { ByBit } from './bybit/ByBit';
import { Binance } from './binance/Binance';
import { EExchange, IExchange, IOffer, IOfferRequest } from './types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExchangeService {
  constructor(
    private readonly byBit: ByBit,
    private readonly binance: Binance,
  ) {}

  public async getOffers(
    request: IOfferRequest,
    exchange: EExchange,
  ): Promise<IOffer[]> {
    return this.exchangeToService(exchange).getOffers(request);
  }

  private exchangeToService(exchange: EExchange): IExchange {
    const map = {
      [EExchange.ByBit]: this.byBit,
      [EExchange.Binance]: this.binance,
    };

    return map[exchange];
  }
}
