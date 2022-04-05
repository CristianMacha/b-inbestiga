import { BadRequestException, Injectable } from '@nestjs/common';

import { Requirement } from './requirement.entity';
import { RequirementRepository } from './requirement.repository';

@Injectable()
export class RequirementService {
    constructor(private requirementRepository: RequirementRepository) { }

    async create(requirement: Requirement): Promise<Requirement> {
        try {
            const newRequirement = this.requirementRepository.create(requirement);
            const newRequirementCreated = await this.requirementRepository.save(newRequirement);
            return newRequirementCreated;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findAll(): Promise<Requirement[]> {
        try {
            const listRequirement = await this.requirementRepository.find();
            return listRequirement;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findOne(requirementId: number): Promise<Requirement> {
        try {
            const requirementDb = await this.requirementRepository.findOne(requirementId);
            return requirementDb;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findByProject(projectId: number): Promise<Requirement[]> {
        try {
            const listRequirement = await this.requirementRepository.find({
                where: { project: { id: projectId } }
            });

            return listRequirement;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
