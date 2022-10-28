import { cpus } from 'os'

type NodeEnvType = 'DEVELOPMENT' | 'TEST' | 'PRODUCTION'

export default {
  APP_PORT: Number(process.env.APP_PORT),
  NODE_ENV: String(process.env.NODE_ENV) as NodeEnvType,
  JWT_SECRET: String(process.env.JWT_SECRET),
  DB_PORT: Number(process.env.DB_PORT) || 5432,
  DB_USERNAME: String(process.env.DB_USERNAME),
  DB_PASSWORD: String(process.env.DB_PASSWORD),
  DB_NAME: String(process.env.DB_NAME),
  DB_LOGGING: Boolean(process.env.DB_LOGGING === 'true'),
  DB_SYNCRONIZE: Boolean(process.env.DB_SYNCRONIZE === 'true'),
  BCRYPT_SALT: Number(process.env.BCRYPT_SALT),
  PARALLEL_QUEUE: 20,
  CPUS_NODES: cpus().length,
  TOKEN_PREFIX: 'JWT',
  EXPIRATION_TOKEN:
    (String(process.env.NODE_ENV) as NodeEnvType) === 'PRODUCTION'
      ? '1d'
      : '7d',
}
