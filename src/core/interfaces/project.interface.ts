import {EProjectStatus} from "../enums/project.enum";

export interface ProjectFilterInterface {
    status: EProjectStatus
}

export interface ProjectAcceptInterface {
    projectId: number;
    amount: number;
    expirationDate: Date;
    advisorId: number;
}
