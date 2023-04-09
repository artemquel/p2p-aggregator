import { Module } from '@nestjs/common';
import { ExchangeModule } from './exchange/ExchangeModule';

@Module({
  imports: [ExchangeModule],
})
export class AppModule {}
