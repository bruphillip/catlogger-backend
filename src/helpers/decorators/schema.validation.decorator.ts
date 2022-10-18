import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const SchemaBody = createParamDecorator(
  async (schemaValidation: any, ctx: ExecutionContext) => {
    const body = ctx.switchToHttp().getRequest().body

    const validatedBody = await schemaValidation(body)

    return validatedBody
  },
)
