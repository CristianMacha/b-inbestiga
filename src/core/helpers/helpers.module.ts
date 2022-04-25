import { Module } from '@nestjs/common';
import { BcryptService } from './bcrypt.service';
import { NanoidService } from './nanoid.service';

@Module({
  providers: [BcryptService, NanoidService],
  exports: [BcryptService, NanoidService],
})
export class HelpersModule {}
