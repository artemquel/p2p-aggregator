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
    // this.findOpportunities({
    //   fiatUnit: 'USD',
    //   cryptoUnit: 'USDT',
    // }).then(console.log);
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
    buyOffer: IOffer,
    sellOffer: IOffer,
    buyExchange: EExchange,
    sellExchange: EExchange,
  ): ISeekerOpportunity {
    const profit = +(sellOffer.price - buyOffer.price).toFixed(4);

    return {
      purchasePrice: buyOffer.price,
      purchaseExchange: buyExchange,
      purchaseAmounts: [buyOffer.minAmount, buyOffer.maxAmount],
      sellPrice: sellOffer.price,
      sellExchange: sellExchange,
      sellAmounts: [sellOffer.minAmount, sellOffer.maxAmount],
      profit,
      profitPercent: +(profit / buyOffer.price).toFixed(4),
    };
  }
}
