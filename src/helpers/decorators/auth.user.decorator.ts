import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export type AuthUserProps = { id: string; email: string; name: string }

export const AuthUser: () => ParameterDecorator = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user as AuthUserProps
  },
)
