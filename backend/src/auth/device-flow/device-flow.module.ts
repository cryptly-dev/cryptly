import { Module } from '@nestjs/common';
import { DeviceFlowController } from './device-flow.controller';
import { DeviceFlowService } from './device-flow.service';

@Module({
  controllers: [DeviceFlowController],
  providers: [DeviceFlowService],
  exports: [DeviceFlowService],
})
export class DeviceFlowModule {}
