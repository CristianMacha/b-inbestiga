import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { Commentary } from './commentary.entity';
import { CommentaryService } from './commentary.service';

@Controller('commentary')
export class CommentaryController {
  constructor(private commentaryServices: CommentaryService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() commentary: Commentary,
    @Req() req,
  ): Promise<Commentary> {
    return await this.commentaryServices.create(commentary, req.user.person);
  }

  @Get('project/:id')
  async findAllByProject(@Param('id') id: string): Promise<Commentary[]> {
    return await this.commentaryServices.findAllByProject(+id);
  }

  @Get('requirement/:id')
  async findAllByRequirement(@Param('id') id: string): Promise<Commentary[]> {
    return await this.commentaryServices.findAllByRequirement(+id);
  }

  @Get('update/active/:id')
  async updateActive(@Param('id') commentaryId: string): Promise<Commentary> {
    return await this.commentaryServices.updateActive(+commentaryId);
  }

  @Put()
  async update(@Body() commentary: Commentary): Promise<Commentary> {
    return await this.commentaryServices.update(commentary);
  }
}
