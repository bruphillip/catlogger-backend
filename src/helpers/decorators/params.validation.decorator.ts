import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Request } from 'express'
import { AnySchema, ValidationError } from 'yup'

type ParamValidProps = {
  field?: string
  validation: AnySchema
}

type ParamValidMethod = (params: ParamValidProps, ctx: ExecutionContext) => any

const paramValidBuilder: ParamValidMethod = async (parameter, ctx) => {
  const params = ctx.switchToHttp().getRequest<Request>().params
  const { field, validation } = parameter || {}

  try {
    const validatedParams = await validation.validate(params)

    return field ? validatedParams[field] : validatedParams
  } catch (err) {
    const error = err as ValidationError
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
  }
}

export const ParamValid = createParamDecorator(paramValidBuilder)
