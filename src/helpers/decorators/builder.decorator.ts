import {
  applyDecorators,
  CallHandler,
  ExecutionContext,
  Injectable,
  Scope,
  UseInterceptors,
} from '@nestjs/common'
import { Request, Response } from 'express'

export type CallbackType = ({
  request,
  response,
  next,
}: {
  request: Request
  response: Response
  next: CallHandler
}) => void | Promise<void>

function DecoratorBuilder(decorators: any) {
  return applyDecorators(UseInterceptors(decorators))
}

@Injectable({ scope: Scope.REQUEST })
class BuilderDecorator {
  callback: CallbackType

  constructor(callback: CallbackType) {
    this.callback = callback
  }

  async intercept(ctx: ExecutionContext, next: CallHandler) {
    const request = ctx.switchToHttp().getRequest<Request>()
    const response = ctx.switchToHttp().getResponse<Response>()

    if (this.callback) {
      await this.callback({ next, request, response })
    }

    return next.handle()
  }
}

export const builderDecorator = (callback: CallbackType) => () =>
  DecoratorBuilder(new BuilderDecorator(callback))
