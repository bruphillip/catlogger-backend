import env from 'constant/env'
import { sign, verify } from 'jsonwebtoken'

export type UserProps = { id: string; name: string; email: string }

class JWTAdapter {
  sign(user: UserProps) {
    return sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      env.JWT_SECRET,
      {
        expiresIn: env.EXPIRATION_TOKEN,
        mutatePayload: false,
      },
    )
  }

  async decode(token: string): Promise<UserProps> {
    if (!token) return
    const [prefix, actualToken] = token.split(' ')

    if (prefix === env.TOKEN_PREFIX) {
      return verify(actualToken, env.JWT_SECRET) as UserProps
    }
    return
  }
}

export const jwtAdapter = new JWTAdapter()
