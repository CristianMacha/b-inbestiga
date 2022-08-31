import {FilterListInterface} from "./filter.interface";
import {EStatusPay} from "../enums/status-pay.enum";

export interface InvoiceFilterInterface extends FilterListInterface {
    status: EStatusPay | 'ALL'
}
