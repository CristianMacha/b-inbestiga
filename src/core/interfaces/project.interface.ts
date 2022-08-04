import {EProjectStatus} from "../enums/project.enum";
import {FilterListInterface} from "./filter.interface";

export interface ProjectFilterInterface extends FilterListInterface {
    status: EProjectStatus | 'ALL'
}

export interface ProjectAcceptInterface {
    projectId: number;
    amount: number;
    expirationDate: Date;
    advisorId: number;
}
