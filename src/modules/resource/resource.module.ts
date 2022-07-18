import {Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";

import {ResourceController} from './resource.controller';
import {ResourceService} from './resource.service';
import {ResourceRepository} from "./resource.repository";

@Module({
    imports: [TypeOrmModule.forFeature([ResourceRepository])],
    controllers: [ResourceController],
    providers: [ResourceService]
})
export class ResourceModule {
}
