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

import { Checkbox, Tooltip, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../theme/raw-colours'
import { useSelector } from 'react-redux'
import juralioColours from '../../../theme/juralio-colours'
import { flatTaskListFromTree } from '../../../services/task/data-provider/task-list-data-provider'

const useStyles = makeStyles()(theme => ({
  menuLayout: {
    display: 'flex',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    width: ' 100%',
    height: '28px',
    alignItems: 'center',
  },

  checkboxWrapper: {
    marginLeft: 'auto',
    display: 'flex',
    color: juralioColours.whiteText.secondary,
  },
  donePip: {
    color: juralioColours.darkText.secondary,
    backgroundColor: rawColours.status.done.dark,
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
    textAlign: 'center',
  },
  inProgressPip: {
    color: juralioColours.darkText.secondary,
    backgroundColor: rawColours.status.inProgress.dark,
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
    textAlign: 'center',
  },
  notStartedPip: {
    color: juralioColours.darkText.secondary,
    backgroundColor: rawColours.status.notStarted.dark,
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
    textAlign: 'center',
  },
  notRequiredPip: {
    backgroundColor: '#616161',
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
    textAlign: 'center',
  },
}))

const StatusSelector = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  const taskCounts = useSelector(state => state.project.taskCounts)
  const project = useSelector(state => state.project)
  const projectContainMilestones =
    flatTaskListFromTree(project).filter(x => x.isMilestone === true).length > 0

  useEffect(() => {
    if (taskCounts.doneCount === 0 && props.statusDone) {
      props.handleDone()
    }
    if (taskCounts.notRequiredCount === 0 && props.statusNotRequired) {
      props.handleDone()
    }
    //eslint-disable-next-line
  }, [taskCounts.doneCount, taskCounts.notRequiredCount])

  return (
    <>
      <div className={classes.menuLayout}>
        <Typography variant="caption">
          {t('taskStatus.not-started') + ' (NS)'}
        </Typography>
        <Tooltip
          title={
            props.disableNotStarted
              ? t('taskFilters.tooltips.noNotStartedTasks')
              : ''
          }
        >
          <div className={classes.checkboxWrapper}>
            <div className={classes.notStartedPip}>
              <Typography>{taskCounts.notStartedCount}</Typography>
            </div>
            <Checkbox
              data-test="not-started-checkbox"
              sx={{
                color: rawColours.primary.black[200],
                '&.Mui-checked': {
                  color: rawColours.primary.black[200],
                },
              }}
              onClick={props.handleNotStarted}
              checked={props.statusNotStarted}
              disabled={props.disableNotStarted}
            />
          </div>
        </Tooltip>
      </div>
      <div className={classes.menuLayout}>
        <Typography variant="caption">
          {t('taskStatus.in-progress') + ' (IP)'}
        </Typography>

        <div className={classes.checkboxWrapper}>
          <div className={classes.inProgressPip}>
            <Typography>{taskCounts.inProgressCount}</Typography>
          </div>
          <Checkbox
            sx={{
              color: rawColours.primary.grey.main,
              '&.Mui-checked': {
                color: rawColours.primary.grey.main,
              },
            }}
            data-test="in-progress-checkbox"
            onClick={props.handleDone}
            checked={true}
            disabled={true}
          />
        </div>
      </div>
      <div className={classes.menuLayout}>
        <Typography variant="caption">
          {t('taskStatus.done') + ' (D)'}
        </Typography>

        <Tooltip
          title={props.disableDone ? t('taskFilters.tooltips.noDoneTasks') : ''}
        >
          <div className={classes.checkboxWrapper}>
            <div className={classes.donePip}>
              <Typography>{taskCounts.doneCount}</Typography>
            </div>
            <Checkbox
              sx={{
                color: rawColours.primary.black[200],
                '&.Mui-checked': {
                  color: rawColours.primary.black[200],
                },
              }}
              data-test="done-checkbox"
              onClick={props.handleDone}
              checked={props.statusDone}
              disabled={props.disableDone}
            />
          </div>
        </Tooltip>
      </div>
      {props.shouldShowNotRequired && (
        <div className={classes.menuLayout}>
          <Typography variant="caption">
            {t('taskStatus.task-not-required') + ' (NR)'}
          </Typography>
          <Tooltip
            title={
              props.disableNotRequired
                ? t('taskFilters.tooltips.noNotRequiredTasks')
                : ''
            }
          >
            <div className={classes.checkboxWrapper}>
              <div className={classes.notRequiredPip}>
                <Typography>{taskCounts.notRequiredCount}</Typography>
              </div>
              <Checkbox
                data-test={'not-required-checkbox'}
                sx={{
                  color: rawColours.primary.black[200],
                  '&.Mui-checked': {
                    color: rawColours.primary.black[200],
                  },
                }}
                onClick={props.handleNotRequired}
                checked={props.statusNotRequired}
                disabled={props.disableNotRequired}
              />
            </div>
          </Tooltip>
        </div>
      )}
    </>
  )
}

StatusSelector.propTypes = {
  statusDone: PropTypes.bool.isRequired,
  statusNotStarted: PropTypes.bool.isRequired,
  handleDone: PropTypes.func.isRequired,
  handleNotStarted: PropTypes.func.isRequired,
  shouldShowNotRequired: PropTypes.bool,
}

export default StatusSelector
