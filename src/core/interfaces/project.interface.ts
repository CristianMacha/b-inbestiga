import { PersonProject } from "../../modules/person-project/person-project.entity";
import { Fee } from "../../modules/fee/fee.entity";
import { Invoice } from "../../modules/invoice/invoice.entity";
import { Project } from "../../modules/project/project.entity";
import {EProjectStatus} from "../enums/project.enum";
import {FilterListInterface} from "./filter.interface";

export interface CreateProjectInterface {
    project: Project;
    invoice: Invoice;
    advisors: PersonProject[];
    students: PersonProject[];
    fees: Fee[];
}

export interface ProjectFilterInterface extends FilterListInterface {
    status: EProjectStatus | 'ALL'
}

export interface ProjectAcceptInterface {
    projectId: number;
    amount: number;
    feesNumber: number;
    expirationDate: Date;
    advisorId: number;
    fees: Fee[];
}
