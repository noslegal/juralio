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

import { Button, Card, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { removeAllNewTasks } from '../../../redux/ducks/improved-taskmap'
import juralioColours from '../../../theme/juralio-colours'

const styles = makeStyles()(theme => ({
  wrapper: {
    position: 'fixed',
    bottom: '5%',
    left: 'calc(50% - 175px)',
    right: 'calc(50% - 175px)',
    width: '350px',
    boxShadow:
      '0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12), 0px 5px 5px -3px rgba(0, 0, 0, 0.2)',

    zIndex: '1004',
  },
  button: {
    margin: 'auto',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: 'white',
    padding: theme.spacing(1),
    borderRadius: 5,
    zIndex: 10,
  },
  text: {
    marginLeft: 'auto',
    marginRight: 'auto',
    color: juralioColours.taskMap.newTasksHighlight,
    fontFamily: theme.typography.fontFamily,
    fontSize: '14px',
    fontWeight: '500',
    height: '16px',
    letterSpacing: '1.25px',
    textTransform: 'uppercase',
  },
}))

const NewTaskHighlightBulkClose = props => {
  const { classes } = styles()
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const onClick = e => {
    e.stopPropagation()
    dispatch(removeAllNewTasks(props.matterId, props.projectId))
  }
  return (
    <Card className={classes.wrapper}>
      <Button
        className={classes.button}
        onClick={onClick}
        data-test="hideAllHighlighted"
      >
        <Typography className={classes.text}>
          {t('taskmapNewTasks.hideAll', { count: props.newTasks.length })}
        </Typography>
      </Button>
    </Card>
  )
}
export default NewTaskHighlightBulkClose
