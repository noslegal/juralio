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

package com.juralio.common

import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic

import java.text.SimpleDateFormat

@CompileStatic
class DateUtilService {

    final String DATETIME = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
    final String LONG_DAY_MONTH_YEAR = "EEE dd MMMM yyyy" // e.g. Tue 31 May 2016
    final String SHORT_MONTH_YEAR = "MMM yyyy" // e.g. Tue 31 May 2016
    final String ISO_8601 = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"

    Date getCurrentDateTime() {
        return new Date()
    }

    String getShortMonthAndYearString(Date date) {
        SimpleDateFormat dt = new SimpleDateFormat(SHORT_MONTH_YEAR)
        return date == null ? "" : dt.format(date)
    }

    String getLongDayMonthAndYearString(Date date) {
        SimpleDateFormat dt = new SimpleDateFormat(LONG_DAY_MONTH_YEAR)
        return date == null ? "" : dt.format(date)
    }

    String getShortDayString(Date date) {
        SimpleDateFormat simpleDateformat = new SimpleDateFormat("E", Locale.ENGLISH)
        return simpleDateformat.format(date)
    }

    String getUTCISO8601String(Date date) {
        SimpleDateFormat sdf = new SimpleDateFormat(ISO_8601)
        sdf.setTimeZone(TimeZone.getTimeZone("UTC"))

        return sdf.format(date)
    }

    @CompileDynamic
    int convertDayOfWeekToInt(String day) {

        int dayAsInt = -1

        for (DaysOfWeek dayOfWeek : DaysOfWeek.values()) {
            if (day.toUpperCase() == dayOfWeek.label) {
                dayAsInt = dayOfWeek.value
                break
            }
        }

        if (dayAsInt == -1) {
            throw new IllegalArgumentException("The passing day is not a week day.")
        }

        return dayAsInt
    }

    int calculateDaysOfWeekDifference(String firstDay, String secondDay) {
        int gap = convertDayOfWeekToInt(firstDay) - convertDayOfWeekToInt(secondDay)

        if (gap <= 0) {
            gap += 7
        }
        return gap
    }

    Date parseSimpleDateFormat(String date, String format) {
        return new SimpleDateFormat(format).parse(date)
    }

    Date parseDatetime(String date) {
        return parseSimpleDateFormat(date, DATETIME)
    }

    Date getStartOfMonth(Date dateInMonth) {
        Calendar cal = Calendar.getInstance()
        cal.setTimeZone(TimeZone.getTimeZone('UTC'))
        cal.set(dateInMonth.year + 1900, dateInMonth.month, 1, 0, 0)
        cal.set(Calendar.SECOND, 0)
        Date start = cal.getTime()
        start.setTime((long) Math.floor(start.getTime() / 1000 as double) * 1000)

        return start
    }

    Date getEndOfMonth(Date startOfMonth) {
        Calendar cal = Calendar.getInstance()
        cal.setTimeZone(TimeZone.getTimeZone('UTC'))
        cal.setTime(startOfMonth)
        cal.add(Calendar.MONTH, 1)
        cal.add(Calendar.MINUTE, -1)
        cal.set(Calendar.SECOND, 59)
        Date end = cal.getTime()
        end.setTime((long) Math.floor(end.getTime() / 1000 as double) * 1000 + 999)

        return end
    }
}
