import {
  Controller,
  Get,
  Param,
  Post,
  PreconditionFailedException,
} from '@nestjs/common'
import { AuthUser, AuthUserProps } from 'helpers/decorators/auth.user.decorator'
import { JwtToken } from 'helpers/decorators/token.apply.decorator'
import { UserRepository } from 'repositories/user/user.repository'
import { UserProps, UserSchema } from './user.schema'

@Controller('user')
export class UserController {
  constructor(private userRepository: UserRepository) {}

  @JwtToken()
  @Post('/:userId/volume/:volumeId')
  async toogleVolumes(
    @AuthUser() user: AuthUserProps,
    @Param('volumeId') volumeId: string,
  ) {
    return (await this.userRepository.toogleVolume(user.id, volumeId))?.omit([
      'password',
    ])
  }

  @JwtToken()
  @Get('/me')
  async me(@AuthUser() user: AuthUserProps) {
    return (await this.userRepository.getById(user.id))?.omit(['password'])
  }

  @Get('id/:id')
  @JwtToken()
  async getById(@Param('id') id: string) {
    return (await this.userRepository.getById(id))?.omit(['password']) || {}
  }

  @Post('/login')
  async login(@UserSchema('login') userBody: UserProps) {
    const user = await this.userRepository.getByEmail(userBody.email)

    if (!user) throw new PreconditionFailedException(user)

    const isSamePass = await user.comparePassword(userBody.password)

    if (!isSamePass) throw new PreconditionFailedException()

    return { ...user.omit(['password']), token: user.sign() }
  }

  @Post('/')
  async create(@UserSchema('create') userBody: UserProps) {
    return (await this.userRepository.create(userBody))?.omit(['password'])
  }
}
