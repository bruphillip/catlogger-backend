import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { User } from 'repositories/user/user.entity'

export type AuthUserProps = Readonly<Omit<User, 'password' | 'updatePassword'>>

export const AuthUser: () => ParameterDecorator = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user as AuthUserProps
  },
)
