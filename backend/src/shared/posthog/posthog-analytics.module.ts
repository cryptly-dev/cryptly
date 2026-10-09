import { Global, Module } from '@nestjs/common';
import { ProductAnalyticsService } from './product-analytics.service';

@Global()
@Module({
  providers: [ProductAnalyticsService],
  exports: [ProductAnalyticsService],
})
export class PosthogAnalyticsModule {}
