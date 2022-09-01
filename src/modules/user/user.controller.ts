import { Controller, Get, Param, Post } from '@nestjs/common'
import { UserRepository } from 'repositories/user/user.repository'

@Controller('user')
export class UserController {
  constructor(private userRepository: UserRepository) {}

  @Post(':userId/volume/:volumeId')
  toogleVolumes(
    @Param('userId') userId: string,
    @Param('volumeId') volumeId: string,
  ) {
    return this.userRepository.toogleVolume(userId, volumeId)
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.userRepository.getById(id)
  }
}
