import { decorate } from 'helpers/schema.decorate'
import { InferType, object, string } from 'yup'

export interface UserSchemaBuildProps {
  login: InferType<ReturnType<UserSchemaBuild['login']>>
  create: InferType<ReturnType<UserSchemaBuild['create']>>
}

class UserSchemaBuild {
  login() {
    return object().shape({
      email: string().email().required(),
      password: string().min(5).required(),
    })
  }

  create() {
    return object().shape({
      email: string().email().required(),
      password: string().min(5).required(),
      name: string().required(),
    })
  }
}

export const UserSchema = decorate(new UserSchemaBuild())
