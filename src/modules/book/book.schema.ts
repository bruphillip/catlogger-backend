import { decorate } from 'helpers/schema.decorate'
import { array, InferType, object, string } from 'yup'

export interface BookSchemaBuildProps {
  save: InferType<ReturnType<BookSchemaBuild['save']>>
}

class BookSchemaBuild {
  save() {
    return object().shape({
      id: string().uuid().nullable(),
      name: string().required(),
      author: string().required(),
      publisher: object({
        id: string().uuid().nullable(),
        name: string().required(),
      }).required(),
      url: string().required(),
      volumes: array(
        object().shape({
          id: string().uuid().nullable(),
          number: string().required(),
          coverUrl: string().url().required(),
          releaseDate: string().required(),
          price: string()
            .required()
            .test({
              test(value, ctx) {
                if (value === '—') return true

                if (!value?.startsWith('R$')) {
                  return ctx.createError({
                    message: 'price is missing correct prefix',
                  })
                }
                return true
              },
            }),
        }),
      )
        .min(1)
        .required(),
    })
  }
}

export const BookSchema = decorate(new BookSchemaBuild())
