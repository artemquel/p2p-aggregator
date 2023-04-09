import { Module } from '@nestjs/common';
import { ExchangeModule } from '../exchange/ExchangeModule';
import { SeekerService } from './SeekerService';

@Module({
  imports: [ExchangeModule],
  providers: [SeekerService],
})
export class SeekerModule {}
