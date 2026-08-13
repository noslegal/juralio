/*
 * Copyright 2026 Graeme and Joanna Johnston
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { getFriendlyTimeText } from './notification-time-helper'

const t = id => id

describe('notification-time-helper.test', () => {
  describe('getFriendlyTimeText', () => {
    it('now', () => {
      expect(getFriendlyTimeText(t, Date.now())).toBe('time.now')
    })
    it('1 minute ago', () => {
      const dt = new Date(Date.now())
      dt.setMinutes(dt.getMinutes() - 1)
      expect(getFriendlyTimeText(t, dt)).toBe('1 time.minuteShort')
    })
    it('15 minutes ago', () => {
      const dt = new Date(Date.now())
      dt.setMinutes(dt.getMinutes() - 15)
      expect(getFriendlyTimeText(t, dt)).toBe('15 time.minuteShort')
    })
    it('59 minutes ago', () => {
      const dt = new Date(Date.now())
      dt.setMinutes(dt.getMinutes() - 59)
      expect(getFriendlyTimeText(t, dt)).toBe('59 time.minuteShort')
    })

    it('60 minutes ago', () => {
      const dt = new Date(Date.now())
      dt.setMinutes(dt.getMinutes() - 60)
      expect(getFriendlyTimeText(t, dt)).toBe('1 time.hourSingularShort')
    })

    it('75 mins ago', () => {
      const dt = new Date(Date.now())
      dt.setMinutes(dt.getMinutes() - 75)
      expect(getFriendlyTimeText(t, dt)).toBe('1 time.hourSingularShort')
    })

    it('5 hours ago', () => {
      const dt = new Date(Date.now())
      dt.setHours(dt.getHours() - 5)
      expect(getFriendlyTimeText(t, dt)).toBe('5 time.hourPluralShort')
    })

    it('23 hours ago', () => {
      const dt = new Date(Date.now())
      dt.setHours(dt.getHours() - 23)
      expect(getFriendlyTimeText(t, dt)).toBe('23 time.hourPluralShort')
    })

    it('24 hours ago', () => {
      const dt = new Date(Date.now())
      dt.setHours(dt.getHours() - 24)
      expect(getFriendlyTimeText(t, dt)).toBe('1 time.daySingularShort')
    })

    it('72 hours ago', () => {
      const dt = new Date(Date.now())
      dt.setHours(dt.getHours() - 72)
      expect(getFriendlyTimeText(t, dt)).toBe('3 time.daysPluralShort')
    })

    it('6 days ago', () => {
      const dt = new Date(Date.now())
      dt.setHours(dt.getHours() - 144)
      expect(getFriendlyTimeText(t, dt)).toBe('6 time.daysPluralShort')
    })

    it('7 days ago', () => {
      const dt = new Date(Date.now())
      dt.setHours(dt.getHours() - 24 * 7)
      expect(getFriendlyTimeText(t, dt)).toBe('1 time.weeksShort')
    })

    it('14 days ago', () => {
      const dt = new Date(Date.now())
      dt.setHours(dt.getHours() - 24 * 7 * 2)
      expect(getFriendlyTimeText(t, dt)).toBe('2 time.weeksShort')
    })

    it('28 days ago', () => {
      const dt = new Date(Date.now())
      dt.setHours(dt.getHours() - 24 * 7 * 4)
      expect(getFriendlyTimeText(t, dt)).toBe('4 time.weeksShort')
    })
  })
})
