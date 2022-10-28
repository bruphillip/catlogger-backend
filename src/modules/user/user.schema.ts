import { object, string, ValidationError } from 'yup'
import { HttpException, HttpStatus } from '@nestjs/common'
import { decorate } from 'helpers/schema.decorate'

export interface UserSchemaBuildProps {
  login: { email: string; password: string }
  create: { name: string; email: string; password: string }
}

class UserSchemaBuild {
  async login(user: UserSchemaBuildProps['login']) {
    try {
      const schema = object().shape({
        email: string().email().required(),
        password: string().min(5).required(),
      })

      const itemSchema = await schema.validate(user)

      return itemSchema
    } catch (err) {
      const error = err as ValidationError
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async create(user: UserSchemaBuildProps['create']) {
    try {
      const schema = object().shape({
        email: string().email().required(),
        password: string().min(5).required(),
        name: string().required(),
      })

      const itemSchema = await schema.validate(user)

      return itemSchema
    } catch (err) {
      const error = err as ValidationError
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}

export const UserSchema = decorate(new UserSchemaBuild())
