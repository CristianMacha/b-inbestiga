import { BadRequestException, Injectable } from '@nestjs/common';
import { Person } from '../person/person.entity';
import { Commentary } from './commentary.entity';
import { CommentaryRepository } from './commentary.repository';

@Injectable()
export class CommentaryService {
    constructor(private commentaryRepository: CommentaryRepository) { }

    async create(commentary: Commentary, userAuth: Person): Promise<Commentary> {
        try {
            const newCommentary = this.commentaryRepository.create(commentary);
            newCommentary.person = userAuth;
            const commentaryCreated = await this.commentaryRepository.save(newCommentary);

            return commentaryCreated;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findAllByProject(projectId: number): Promise<Commentary[]> {
        try {
            const listCommentary = await this.commentaryRepository.find({
                where: { 
                    project: { id: projectId },
                    active: true,
                },
                order: {
                    createdAt: 'DESC'
                }
            });

            return listCommentary;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
