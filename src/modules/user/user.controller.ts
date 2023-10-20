import {
  Controller,
  Get,
  Param,
  Post,
  PreconditionFailedException,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthUser, AuthUserProps } from 'helpers/decorators/auth.user.decorator'
import { JwtToken } from 'helpers/decorators/token.apply.decorator'
import { UserRepository } from 'repositories/user/user.repository'

import { UserSchemaBuildProps, UserSchema } from './user.schema'

@Controller('user')
export class UserController {
  constructor(private userRepository: UserRepository) {}

  @JwtToken()
  @Post('volume/:volumeId')
  async toogleVolumes(
    @AuthUser() user: AuthUserProps,
    @Param('volumeId') volumeId: string,
  ) {
    return this.userRepository.toogleVolume(user.id, volumeId)
  }

  @JwtToken()
  @Get('/me')
  async me(@AuthUser() user: AuthUserProps) {
    try {
      const me = await this.userRepository.getById(user?.id)
      return this.userRepository.omit(me, ['password'])
    } catch (err) {
      throw new UnauthorizedException()
    }
  }

  @Get('id/:id')
  @JwtToken()
  async getById(@Param('id') id: string) {
    const user = await this.userRepository.getById(id)
    return this.userRepository.omit(user, ['password'])
  }

  @Post('/login')
  async login(@UserSchema('login') userBody: UserSchemaBuildProps['login']) {
    try {
      const user = await this.userRepository.getByEmail(userBody.email)

      if (!user) throw new PreconditionFailedException(user)

      const isSamePass = await this.userRepository.cryto.compare(
        userBody.password,
        user.password,
      )

      if (!isSamePass) throw new PreconditionFailedException()

      const loggedUser = this.userRepository.omit(user, ['password'])

      return {
        ...loggedUser,
        token: this.userRepository.sign(loggedUser as any),
      }
    } catch (err) {
      throw new UnauthorizedException('invalid login')
    }
  }

  @Post('/')
  async create(@UserSchema('create') userBody: UserSchemaBuildProps['create']) {
    const user = await this.userRepository.create(userBody)
    return this.userRepository.omit(user, ['password'])
  }

  @Post('like/:bookId')
  @JwtToken()
  async toogleLike(
    @AuthUser() user: AuthUserProps,
    @Param('bookId') bookId: string,
  ) {
    return this.userRepository.toogleLike(user.id, bookId)
  }
}
