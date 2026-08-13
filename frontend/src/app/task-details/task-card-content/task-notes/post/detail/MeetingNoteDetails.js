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

import { Typography, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'
import DateFieldOld from '../../../../../../components/inputs/date-field-old/DateFieldOld'
import MeetingNoteTimePicker from './helpers/MeetingNoteTimePicker'
import { userTimeZone } from './helpers/time-helpers'
import MeetingNotePeopleContainer from './MeetingNotePeopleContainer'

const styles = theme => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    flexWrap: 'wrap',
  },
  meetingDetails: {
    display: 'flex',
    marginBottom: theme.spacing(2),
    alignItems: 'center',
  },
  meetingAttendees: {
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'end',
    marginRight: theme.spacing(3),
    minHeight: theme.spacing(7),
  },
  datePicker: {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  startTimePicker: {
    marginLeft: 0,
  },
  text: {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  datePickerMobile: {
    width: '42%',
    marginLeft: '-40px',
    padding: 0,
    marginTop: theme.spacing(2.5),
  },
  meetingOn: {
    whiteSpace: 'nowrap',
    marginTop: theme.spacing(2),
  },
  timezoneWrapper: {
    marginTop: theme.spacing(2),
  },
})

const MeetingNoteDetails = props => {
  const { t } = useTranslation()
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'))
  const { classes, update } = props

  return (
    <div className={classes.row}>
      <div className={classes.meetingDetails}>
        {!isMobileView && (
          <Typography className={classes.meetingOn}>
            {t('postDetails.meetingNote.meetingOn')}
          </Typography>
        )}
        <div
          className={
            isMobileView ? classes.datePickerMobile : classes.datePicker
          }
        >
          <DateFieldOld
            dateType={'start'}
            data-test="meeting-date"
            value={props.date}
            onChange={date => {
              update('date', date)
            }}
            maxDate={new Date()}
            hideIcon={true}
            noPadding={true}
            viewOnly={props.viewOnly}
            disabled={props.dateOnly || props.viewOnly}
          />
        </div>
        {!isMobileView && (
          <Typography className={classes.text}>{t('common.from')}</Typography>
        )}

        <div className={classes.startTimePicker}>
          <MeetingNoteTimePicker
            initialValue={new Date(props.startTime)}
            onUpdate={value => update('startTime', value)}
            label={t('postDetails.meetingNote.startTime')}
            isMobileView={isMobileView}
            viewOnly={props.viewOnly}
          />
        </div>

        {!isMobileView && (
          <Typography className={classes.text}>{t('common.to')}</Typography>
        )}

        <MeetingNoteTimePicker
          initialValue={new Date(props.endTime)}
          onUpdate={value => update('endTime', value)}
          isMobileView={isMobileView}
          label={t('postDetails.meetingNote.endTime')}
          viewOnly={props.viewOnly}
        />
        <Typography className={classes.text}>{t('common.in')}</Typography>
        <div className={classes.timezoneWrapper}>
          <Typography variant="caption">{userTimeZone}</Typography>
        </div>
      </div>
      <div className={classes.meetingAttendees}>
        <Typography>{t('postDetails.meetingNote.membersLabel')}</Typography>
        <MeetingNotePeopleContainer viewOnly={props.viewOnly} />
      </div>
    </div>
  )
}

export default withStyles(MeetingNoteDetails, styles)
