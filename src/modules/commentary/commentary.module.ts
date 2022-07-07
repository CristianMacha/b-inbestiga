import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommentaryController } from './commentary.controller';
import { CommentaryRepository } from './commentary.repository';
import { CommentaryService } from './commentary.service';

@Module({
  imports: [TypeOrmModule.forFeature([CommentaryRepository])],
  controllers: [CommentaryController],
  providers: [CommentaryService],
})
export class CommentaryModule {}
