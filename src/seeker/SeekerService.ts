import { Injectable } from '@nestjs/common';
import { ExchangeService } from '../exchange/ExchangeService';

import { ISeekerOpportunity } from './types';
import {
  EExchange,
  EOfferDirection,
  IOffer,
  IOfferRequest,
} from '../exchange/types';

@Injectable()
export class SeekerService {
  constructor(private readonly exchangeService: ExchangeService) {
    this.findOpportunities({
      fiatUnit: 'USD',
      cryptoUnit: 'USDT',
    }).then(console.log);
  }

  public async findOpportunities(
    request: Omit<IOfferRequest, 'direction'>,
  ): Promise<ISeekerOpportunity[]> {
    const opportunities: ISeekerOpportunity[] = [];

    const offers = await this.exchangeService.getOffers(request);
    const exchanges = Object.keys(offers) as EExchange[];

    for (const currentExchange of exchanges) {
      const currentExchangeOffers = offers[currentExchange];
      const currentExchangeBuyOffers =
        currentExchangeOffers[EOfferDirection.BUY];

      for (const targetExchange of exchanges) {
        const targetExchangeOffers = offers[targetExchange];
        const targetExchangeSellOffers =
          targetExchangeOffers[EOfferDirection.SELL];

        for (const currentExchangeBuyOffer of currentExchangeBuyOffers) {
          for (const targetExchangeSellOffer of targetExchangeSellOffers) {
            if (
              this.isOpportunity(
                currentExchangeBuyOffer,
                targetExchangeSellOffer,
              )
            ) {
              opportunities.push(
                this.formatOpportunity(
                  currentExchangeBuyOffer,
                  targetExchangeSellOffer,
                  currentExchange,
                  targetExchange,
                ),
              );
            }
          }
        }
      }
    }

    return opportunities.sort((a, b) => b.profit - a.profit);
  }

  private isOpportunity(buyOffer: IOffer, sellOffer: IOffer): boolean {
    return (
      buyOffer.price < sellOffer.price &&
      buyOffer.minAmount >= sellOffer.minAmount &&
      buyOffer.maxAmount <= sellOffer.maxAmount
    );
  }

  private formatOpportunity(
    buy: IOffer,
    sell: IOffer,
    buyExchange: EExchange,
    sellExchange: EExchange,
  ): ISeekerOpportunity {
    return {
      purchasePrice: buy.price,
      purchaseExchange: buyExchange,
      purchaseAmounts: [buy.minAmount, buy.maxAmount],
      sellPrice: sell.price,
      sellExchange: sellExchange,
      sellAmounts: [sell.minAmount, sell.maxAmount],
      profit: sell.price - buy.price,
      profitPercent: (sell.price - buy.price) / buy.price,
    };
  }
}
