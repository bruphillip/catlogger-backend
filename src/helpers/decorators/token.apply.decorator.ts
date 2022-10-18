import { builderDecorator, CallbackType } from './builder.decorator'
import { UnauthorizedException } from '@nestjs/common'
import { jwtAdapter } from 'helpers/jwt'

const tokenApply: CallbackType = async ({ request }) => {
  try {
    const token = request.headers.authorization
    const user = await jwtAdapter.decode(token)

    if (!user) {
      throw new UnauthorizedException('invalid token')
    }

    Object.assign(request, { user })
  } catch (err) {
    throw new UnauthorizedException(err.message)
  }
}

export const JwtToken = builderDecorator(tokenApply)
