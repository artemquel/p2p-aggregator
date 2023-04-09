import { Module } from '@nestjs/common';
import { SeekerModule } from './seeker/SeekerModule';

@Module({
  imports: [SeekerModule],
})
export class AppModule {}
