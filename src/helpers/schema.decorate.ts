import { SchemaBody } from './decorators/schema.validation.decorator'

export function decorate<T>(method: T) {
  return (methodName: keyof typeof method) => {
    return SchemaBody(method[methodName])
  }
}
