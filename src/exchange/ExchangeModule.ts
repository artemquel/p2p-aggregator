import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { Binance } from './binance/Binance';
import { ByBit } from './bybit/ByBit';
import { ExchangeService } from './ExchangeService';
import { Okx } from './okx/Okx';

@Module({
  imports: [HttpModule],
  providers: [Okx, Binance, ByBit, ExchangeService],
  exports: [ExchangeService],
})
export class ExchangeModule {}
