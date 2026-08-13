import dayjs from 'dayjs'
import { DATE_FORMAT_FULL, DATE_FORMAT_NO_YEAR } from './date_constants'

export function getDateDisplayString(date, dateFormat, fulldateOnly) {
  if (!date) {
    return undefined
  }
  if (!dateFormat) {
    dateFormat = DATE_FORMAT_FULL
  }
  const currentDate = dayjs().startOf('day')
  const endDate = dayjs(dayjs(date)).startOf('day')
  const comparison = endDate.diff(currentDate, 'day')

  if (!fulldateOnly) {
    if (comparison === 0) return 'Today'
    if (comparison === 1) return 'Tomorrow'
    if (comparison === -1) return 'Yesterday'
  }
  return dayjs(date).format(dateFormat)
}

export function getTimeDisplayString(date) {
  if (date) {
    return dayjs(date).format('HH:mm')
  }
}

export function isInThePast(date) {
  return new Date(date).getTime() < new Date().getTime()
}

export function getDisplayString(date) {
  return getDateDisplayString(date, DATE_FORMAT_NO_YEAR)
}
