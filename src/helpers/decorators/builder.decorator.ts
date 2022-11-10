import {
  applyDecorators,
  CallHandler,
  ExecutionContext,
  Injectable,
  Scope,
  UseInterceptors,
} from '@nestjs/common'
import { Request, Response } from 'express'

export type CallbackType = (
  {
    request,
    response,
    next,
  }: {
    request: Request
    response: Response
    next: CallHandler
  },
  property: any,
) => void | Promise<void>

function DecoratorBuilder(decorators: any) {
  return applyDecorators(UseInterceptors(decorators))
}

@Injectable({ scope: Scope.TRANSIENT })
class BuilderDecorator {
  callback: CallbackType

  constructor(callback: CallbackType, private property: any) {
    this.callback = callback
  }

  async intercept(ctx: ExecutionContext, next: CallHandler) {
    const request = ctx.switchToHttp().getRequest<Request>()
    const response = ctx.switchToHttp().getResponse<Response>()

    if (this.callback) {
      await this.callback({ next, request, response }, this.property)
    }

    return next.handle()
  }
}

export const builderDecorator = (callback: CallbackType) => (property?: any) =>
  DecoratorBuilder(new BuilderDecorator(callback, property))
