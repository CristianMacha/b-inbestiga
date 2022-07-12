import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Person } from '../person/person.entity';
import { Commentary } from './commentary.entity';
import { CommentaryRepository } from './commentary.repository';

@Injectable()
export class CommentaryService {
  constructor(private commentaryRepository: CommentaryRepository) {}

  async create(commentary: Commentary, userAuth: Person): Promise<Commentary> {
    try {
      const newCommentary = this.commentaryRepository.create(commentary);
      newCommentary.person = userAuth;
      const commentaryCreated = await this.commentaryRepository.save(
        newCommentary,
      );

      return commentaryCreated;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAllByProject(projectId: number): Promise<Commentary[]> {
    try {
      const listCommentary = await this.commentaryRepository.find({
        relations: ['person'],
        where: {
          project: { id: projectId },
          active: true,
        },
        order: {
          createdAt: 'DESC',
        },
      });

      return listCommentary;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAllByRequirement(requirementId: number): Promise<Commentary[]> {
    try {
      const listCommentary = await this.commentaryRepository.find({
        relations: ['person'],
        where: {
          requirement: { id: requirementId },
          active: true,
        },
        order: {
          createdAt: 'DESC',
        },
      });

      return listCommentary;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateActive(commentaryId: number): Promise<Commentary> {
    try {
      const commentaryDb = await this.commentaryRepository.findOne(
        commentaryId,
      );
      if (!commentaryDb) {
        throw new NotFoundException('Commentary not found.');
      }

      commentaryDb.active = !commentaryDb.active;
      const commentaryUpdated = await this.commentaryRepository.save(
        commentaryDb,
      );
      return commentaryUpdated;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async update(commentary: Commentary): Promise<Commentary> {
    try {
      const commentaryDb = await this.commentaryRepository.preload(commentary);
      if (!commentaryDb) {
        throw new NotFoundException('commentary not found.');
      }

      const commentaryUpdated = await this.commentaryRepository.save(
        commentaryDb,
      );
      return commentaryUpdated;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
