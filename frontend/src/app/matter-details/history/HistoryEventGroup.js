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

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import UserAvatar from '../../../components/data-display/user/user-avatar/UserAvatar'
import {
  getActioneer,
  getOccurredAt,
} from '../../../components/navigation/global-notifications/helpers/typed-payload-renderers/notification-accessors'
import { getNotificationContent } from '../../../components/navigation/global-notifications/helpers/typed-payload-renderers'
import { formatUserDisplayName } from '../../../services/user/helper/user-format-service'

const useStyles = makeStyles()(theme => ({
  accordion: {
    // MUI hides the ::before divider on an expanded accordion and its
    // following sibling, so replace it with a persistent bottom border.
    '&:before': {
      display: 'none',
    },
    '&:not(:last-of-type)': {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  },
  summaryContent: {
    alignItems: 'center',
    display: 'flex',
    gap: theme.spacing(1.5),
    width: '100%',
  },
  actor: {
    fontWeight: theme.typography.fontWeightBold,
  },
  time: {
    color: theme.palette.text.secondary,
  },
  badges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
    marginLeft: 'auto',
    marginRight: theme.spacing(1),
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
  },
  eventRow: {
    alignItems: 'flex-start',
    display: 'flex',
    gap: theme.spacing(1.5),
  },
  eventIcon: {
    flexShrink: 0,
    paddingTop: theme.spacing(0.25),
  },
  eventTitle: {
    fontWeight: theme.typography.fontWeightMedium,
  },
  eventTime: {
    color: theme.palette.text.secondary,
  },
}))

const HistoryEventRow = ({ event, currentUser }) => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const content = getNotificationContent(t, event, currentUser)
  return (
    <div className={classes.eventRow} data-test="history-event">
      <div className={classes.eventIcon}>{content.icon}</div>
      <div>
        <Typography variant="body2" className={classes.eventTitle}>
          {content.title}
        </Typography>
        <Typography variant="caption">{content.body}</Typography>
        <Typography
          variant="caption"
          className={classes.eventTime}
          component="div"
        >
          {content.time}
        </Typography>
      </div>
    </div>
  )
}

const HistoryEventGroup = ({ group, currentUser }) => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const firstEvent = group.events[0]
  const actor = getActioneer(firstEvent)
  const occurredAt = getOccurredAt(firstEvent)

  return (
    <Accordion
      className={classes.accordion}
      data-test="history-event-group"
      disableGutters
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        data-test="history-event-group-summary"
      >
        <div className={classes.summaryContent}>
          <UserAvatar user={actor} small />
          <Typography className={classes.actor}>
            {formatUserDisplayName(actor)}
          </Typography>
          <Typography variant="caption" className={classes.time}>
            {dayjs(occurredAt).format('DD MMM YYYY, HH:mm')}
          </Typography>
          <div className={classes.badges}>
            {Object.entries(group.categoryCounts).map(([category, count]) => (
              <Chip
                key={category}
                size="small"
                label={`${t(`matterHistory.categories.${category}`)} ×${count}`}
              />
            ))}
          </div>
        </div>
      </AccordionSummary>
      <AccordionDetails className={classes.details}>
        {group.events.map(event => (
          <HistoryEventRow
            key={event.id}
            event={event}
            currentUser={currentUser}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  )
}

export default HistoryEventGroup
