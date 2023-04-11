import { Controller, Get } from '@nestjs/common';
import { SeekerService } from './SeekerService';

@Controller('/seeker')
export class SeekerController {
  constructor(private readonly seekerService: SeekerService) {}

  @Get('/')
  get() {
    return this.seekerService.findOpportunities({
      fiatUnit: 'RUB',
      cryptoUnit: 'USDT',
      paymentTypes: [],
    });
  }
}
