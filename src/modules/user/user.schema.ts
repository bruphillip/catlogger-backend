import { object, string, ValidationError } from 'yup'
import { HttpException, HttpStatus } from '@nestjs/common'
import { User } from 'repositories/user/user.entity'
import { decorate } from 'helpers/schema.decorate'

export type UserProps = Partial<User>

class UserSchemaBuild {
  async login(user: UserProps) {
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

  async create(user: UserProps) {
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
