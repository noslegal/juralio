import dayjs from 'dayjs'
import { DATE_FORMAT_FULL } from './date_constants'

export default {
  getCurrentDateAsString() {
    return dayjs().format(DATE_FORMAT_FULL)
  },
}
