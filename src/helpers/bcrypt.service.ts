import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  async encryptPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltOrRounds);
    return passwordHash;
  }

  async decrypt(
    password: string | Buffer,
    passwordEncrypted: string,
  ): Promise<boolean> {
    const matched = await bcrypt.compare(password, passwordEncrypted);
    return matched;
  }
}
