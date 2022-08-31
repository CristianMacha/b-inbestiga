import {PaymentMethodEnum} from "../enums/payment.enum";

export interface PaymentCreateInterface {
    conceptId: number;
    amount: number;
    paymentMethod: PaymentMethodEnum
}
