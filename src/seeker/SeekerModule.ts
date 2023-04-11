import { Module } from '@nestjs/common';
import { ExchangeModule } from '../exchange/ExchangeModule';
import { SeekerService } from './SeekerService';
import { SeekerController } from './SeekerController';

@Module({
  imports: [ExchangeModule],
  providers: [SeekerService],
  controllers: [SeekerController],
})
export class SeekerModule {}
