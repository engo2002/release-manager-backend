import { Module } from '@nestjs/common';
import {QueryHelperService} from "./query-helper/query-helper.service";

@Module({
    providers: [QueryHelperService],
    exports: [QueryHelperService]
})
export class SharedModule {}
