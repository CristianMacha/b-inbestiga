import { Module } from '@nestjs/common';

import { BcryptService } from './helpers/bcrypt.service';
import { NanoidService } from './helpers/nanoid.service';

@Module({
    imports: [],
    providers: [
        BcryptService,
        NanoidService,
    ],
    exports: [
        BcryptService, 
        NanoidService,
    ],
})
export class CoreModule {}
