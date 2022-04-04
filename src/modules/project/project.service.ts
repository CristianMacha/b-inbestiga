import { BadRequestException, Injectable } from '@nestjs/common';
import { Project } from './project.entity';
import { ProjectRepository } from './project.repository';

@Injectable()
export class ProjectService {
    constructor(
        private projectRepository: ProjectRepository
    ) { }

    async create(project: Project): Promise<Project> {
        try {
            const newProject = this.projectRepository.create(project);
            const newProjectCreated = await this.projectRepository.save(newProject);
            return newProjectCreated;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findAll(): Promise<Project[]> {
        try {
            const listProject = await this.projectRepository.find({ where: { active: true } });
            return listProject;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findOne(projectId: number): Promise<Project> {
        try {
            const projectDb = await this.projectRepository.findOne(projectId);
            return projectDb;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    async findByPerson(personId: number): Promise<Project[]> {
        try {
            const listProject = await this.projectRepository.findByPerson(personId);
            return listProject;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
