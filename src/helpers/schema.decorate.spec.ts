import { array, InferType, object, string } from 'yup'
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants'
import { decorate } from './schema.decorate'

describe('Schema Decorator', () => {
  const fn = jest.fn()

  class SchemaTest {
    test() {
      fn()

      return object({
        test: string().equals(['test']),
      })
    }
  }
  it.only('should call decorator correctly', async () => {
    const schemaTest = new SchemaTest()
    const decorator = decorate(schemaTest)

    class Imp {
      implement(@decorator('test') p) {
        return 'something'
      }
    }

    const imp = new Imp()

    const resp = imp.implement({ test: 'oi' })

    const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Imp, 'implement')
    console.log(args[Object.keys(args)[0]].factory)

    expect(fn).toBeCalled()
  })
})
