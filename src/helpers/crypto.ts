import { compare, hash } from 'bcrypt'
import env from 'constant/env'

export class Crypto {
  async hash(password: string) {
    return hash(password, Number(env.BCRYPT_SALT))
  }

  async compare(password, crypted) {
    return compare(password, crypted)
  }
}
