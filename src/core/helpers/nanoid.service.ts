import {Injectable} from '@nestjs/common';
import {customAlphabet} from 'nanoid/async';

@Injectable()
export class NanoidService {
    async gUserCode(): Promise<string> {
        const alphabet = '0123456789';
        const nanoid = customAlphabet(alphabet, 7);
        const code = await nanoid();
        return code;
    }

    async gProjectCode(): Promise<string> {
        try {
            const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const nanoId = customAlphabet(alphabet, 15);
            const code = await nanoId();
            return code;
        } catch (error) {
            throw new Error('NanoId error generate');
        }
    }

    async gPaymentCode(): Promise<string> {
        try {
            const alphabet = '0123456789P';
            const nanoId = customAlphabet(alphabet, 7);
            return await nanoId();
        } catch (error) {
            throw new Error('NanoId error generate.');
        }
    }
}
