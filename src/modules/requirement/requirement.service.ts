import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

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

    async updateActive(requirementId: number): Promise<Requirement> {
        try {
            const requirementDb = await this.requirementRepository.findOne(requirementId);
            if (!requirementDb) { throw new NotFoundException('Requirement not found.'); }

            requirementDb.active = !requirementDb.active;
            const requirementUpdate = await this.requirementRepository.save(requirementDb);
            return requirementUpdate;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async update(requirement: Requirement): Promise<Requirement> {
        try {
            const requirementDb = await this.requirementRepository.preload(requirement);
            if (!requirementDb) { throw new NotFoundException('Requirement not found.'); }

            const requirementUpdate = await this.requirementRepository.save(requirementDb);
            return requirementUpdate;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
