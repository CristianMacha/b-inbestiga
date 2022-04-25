import { Injectable } from '@nestjs/common';
import { nanoid, customAlphabet } from 'nanoid/async';

@Injectable()
export class NanoidService {
  async gUserCode(): Promise<string> {
    const alphabet: string = '0123456789';
    const nanoid = customAlphabet(alphabet, 7);
    const code = await nanoid();
    return code;
  }
}
