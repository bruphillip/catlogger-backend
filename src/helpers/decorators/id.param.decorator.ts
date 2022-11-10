import { object, string } from 'yup'

import { ParamValid } from './params.validation.decorator'

const validation = object().shape({ id: string().uuid().required() }).required()

export const ParamId = () => ParamValid({ field: 'id', validation })
