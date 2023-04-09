import { Injectable } from '@nestjs/common';
import { ExchangeService } from '../exchange/ExchangeService';

import { ISeekerOpportunity } from './types';
import { IOfferRequest } from '../exchange/types';

@Injectable()
export class SeekerService {
  constructor(private readonly exchangeService: ExchangeService) {}

  // public async findOpportunities(
  //   request: Omit<IOfferRequest, 'direction'>,
  // ): Promise<ISeekerOpportunity[]> {
  //   const offers = await this.exchangeService.getOffers(request);
  // }
}
