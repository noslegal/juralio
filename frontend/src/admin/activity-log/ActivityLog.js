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

import InsightsIcon from '@mui/icons-material/Insights'
import {
  CircularProgress,
  DialogContent,
  Tooltip,
  Typography,
} from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import JuralioDialog from '../../components/dialog/juralio-dialog/JuralioDialog'
import colorModifiers from '../../theme/color-modifiers'
import rawColours from '../../theme/raw-colours'
const style = makeStyles()(theme => ({
  entryWrapper: {
    display: 'flex',
    flexDirection: 'row',
    borderRadius: theme.spacing(),
    paddingLeft: theme.spacing(),
  },
  entryDetailsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  pipWrapper: {
    width: theme.spacing(4),
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
  },
  pip: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    borderRadius: theme.spacing(4),
    backgroundColor: rawColours.primary.primary.main,
  },
  pipe: {
    width: theme.spacing(0.25),
    backgroundColor: 'black',
    height: `calc(50% - ${theme.spacing(2)})`,
  },
  contentWrapper: {
    marginLeft: theme.spacing(),
    display: 'flex',
    justifyContent: 'center',
  },
  spinner: {
    marginLeft: `calc(50% - 40px)`,
    marginTop: `calc(40% - 40px)`,
  },
}))

const ActivityLogItem = props => {
  const { classes } = style()

  const getContent = () => {
    if (props.item.type === 'user_session_event') {
      return (
        <div className={classes.entryDetailsWrapper}>
          <Typography>
            {props.item.event_type}: {props.item.time}
          </Typography>
        </div>
      )
    }
    if (props.item.type === 'audit_log_event') {
      return (
        <div className={classes.entryDetailsWrapper}>
          <Typography>
            {props.item.className.split('.').at(-1)}(
            {props.item.persistedObjectId}): {props.item.propertyName}
          </Typography>
          <Typography>
            {props.item.eventName}:{' '}
            {props.item.oldValue ? props.item.oldValue : '-'} →{' '}
            {props.item.newValue ? props.item.newValue : '-'}
          </Typography>
        </div>
      )
    }
    return 'unknown entry!'
  }

  return (
    <div
      className={classes.entryWrapper}
      style={{
        backgroundColor:
          props.index % 2 === 0
            ? colorModifiers.secondaryBackground(rawColours.primary.black[200])
            : '',
      }}
    >
      <div className={classes.pipWrapper}>
        {props.index !== 0 && <div className={classes.pipe} />}
        <Tooltip title={props.item.time}>
          <div className={classes.pip}> </div>
        </Tooltip>
        {props.index < props.totalSize - 1 && <div className={classes.pipe} />}
      </div>
      <div className={classes.contentWrapper}>{getContent()}</div>
    </div>
  )
}

const ActivityLog = props => {
  const { t } = useTranslation()
  const { classes } = style()
  return (
    <JuralioDialog
      open={true}
      titleText={t('userList.activityLog')}
      titleIcon={InsightsIcon}
      cancelText={t('common.download')}
      onClose={props.onClose}
      handleAction={props.onClose}
      handleCancel={props.downloadActivityLog}
      actionLabel={t('common.close')}
    >
      <DialogContent>
        {!props.isLoaded && (
          <CircularProgress className={classes.spinner} size={80} />
        )}
        {props.isLoaded && props.data.length === 0 && (
          <Typography>{t('userList.activityLogNoEntries')}</Typography>
        )}
        {props.isLoaded &&
          props.data.map((item, index) => {
            return (
              <ActivityLogItem
                item={item}
                index={index}
                totalSize={props.data.length}
              />
            )
          })}
      </DialogContent>
    </JuralioDialog>
  )
}
export default ActivityLog
