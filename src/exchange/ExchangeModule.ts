import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { Binance } from './binance/Binance';
import { ByBit } from './bybit/ByBit';
import { ExchangeService } from './ExchangeService';

@Module({
  imports: [HttpModule],
  providers: [Binance, ByBit],
  exports: [ExchangeService],
})
export class ExchangeModule {}
