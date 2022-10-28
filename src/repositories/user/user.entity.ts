export class User {
  id: string
  name: string
  email: string
  volumes?: string[] //BookVolume[]
  password: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date

  // async updatePassword() {
  //   this.password = await hash(this.password, Number(env.BCRYPT_SALT))
  // }

  // async comparePassword(password) {
  //   return compare(password, this.password)
  // }

  // sign() {
  //   return jwtAdapter.sign(this)
  // }

  // omit(field: (keyof User)[]) {
  //   return omit(this, field)
  // }
}
