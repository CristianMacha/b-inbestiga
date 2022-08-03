import {EProjectStatus} from "../enums/project.enum";
import {Project} from "../../modules/project/project.entity";

export interface ProjectFilterInterface {
    status: EProjectStatus | 'ALL'
    take: number;
    skip: number;
}

export interface ProjectAcceptInterface {
    projectId: number;
    amount: number;
    expirationDate: Date;
    advisorId: number;
}

export interface ProjectResponseInterface {
    data: Project[];
    total: number;
}
