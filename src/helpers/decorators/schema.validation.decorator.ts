import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { ObjectSchema, ValidationError } from 'yup'

type SchemaReturn = () => ObjectSchema<any>

export const SchemaBody = createParamDecorator(
  async (schema: SchemaReturn, ctx: ExecutionContext) => {
    const body = ctx.switchToHttp().getRequest().body

    try {
      const validatedBody = schema()

      return await validatedBody.validate(body)
    } catch (err) {
      const error = err as ValidationError
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  },
)
