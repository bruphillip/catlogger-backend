import { format, parse } from 'date-fns'

const PT_BR_PATTERN = 'dd/MM/yyyy'

export function formatTo(date: Date, pattern = PT_BR_PATTERN) {
  return format(date, pattern)
}

export function stringToDate(date: string, pattern = PT_BR_PATTERN): Date {
  return parse(date, pattern, new Date())
}
