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

import LinkIcon from '@mui/icons-material/Link'
import cloneDeep from 'lodash/cloneDeep'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import LightButton from '../../../../components/inputs/light-button/LightButton'

//import useExperimentalSettings from '../../../../hooks/experimental-settings-hook'
import { DateLinkingIcon } from '../../../../theme/navigation/CommonIcons'
import { TASK_STATUS } from '../../../constants'
import {
  addTaskBlocked,
  addTaskBlocker,
  deleteTaskBlocker,
} from '../../../task-map/selected-task/selected-task-actions'
import TaskBlockDisplay from './TaskBlockComponents/TaskBlockDisplay'
import TaskBlockDialog from './TaskBlockDialog'
import TaskEditLinkDialog from './TaskEditLinkDialog'
import TaskLinkButton from './TaskLinkButton'
import { Typography } from '@mui/material'

const style = theme => ({
  container: {
    marginTop: theme.spacing(2),
  },
  iconWrapper: {
    gridArea: 'lhc',
    width: 'fit-content',
  },
  content: {
    gridArea: 'rhc',
  },
  buttonWrapper: {
    display: 'flex',
    marginBottom: theme.spacing(0.5),
  },
  viewOnly: {
    display: 'flex',
    marginTop: theme.spacing(1.5),
  },
})

const TaskLinksContainer = props => {
  const { classes } = makeStyles()(style)()
  const [openLinkDialog, setOpenLinkDialog] = useState(false)
  const [openBlocksDialog, setOpenBlocksDialog] = useState(false)
  //const experimentalOptions = useExperimentalSettings()

  const showLinks = false
  // experimentalOptions.loaded &&
  // !experimentalOptions.options.disableTaskLinking

  const { t } = useTranslation()
  const dispatch = useDispatch()
  let block = 0
  let blocks = 0

  const zeroStateBlockers = props.task.blockers?.length === 0
  const zeroStateDateLink = !props.task.datesLinkedToSiblings

  if (props.task?.blockers) {
    props.task.blockers.forEach(item => {
      if (item.blocked.id === props.task.id) {
        block = block + 1
      } else if (item.blocker.id === props.task.id) {
        blocks = blocks + 1
      }
    })
  }

  const editTaskLinkDialog = () => {
    return (
      <TaskEditLinkDialog
        task={props.task}
        matterId={props.matterId}
        projectId={props.projectId}
        siblings={cloneDeep(props.siblings)}
        siblingTaskCount={
          props.siblingTaskCount > 0
            ? props.siblingTaskCount + 1
            : props.siblingTaskCount
        }
        handleCancel={() => {
          setOpenLinkDialog(false)
        }}
        handleClose={() => {
          setOpenLinkDialog(false)
        }}
      />
    )
  }

  const submitBlockers = async (
    existingBlocksToRemove,
    blockedTasks,
    blockerTasks
  ) => {
    for (let i = 0; i < existingBlocksToRemove.length; i++) {
      let eb = existingBlocksToRemove[i]
      await dispatch(
        deleteTaskBlocker(
          eb.blocked.id,
          eb.blocker.id,
          props.projectId,
          props.matterId,
          eb.id
        )
      )
    }
    blockedTasks
      .filter(bt => !props.task.blockers.map(b => b.blocked.id).includes(bt.id))
      .map(bt => {
        dispatch(
          addTaskBlocked(bt.id, props.task.id, props.projectId, props.matterId)
        )
        return null
      })
    blockerTasks
      .filter(bt => !props.task.blockers.map(b => b.blocker.id).includes(bt.id))
      .map(bt => {
        dispatch(
          addTaskBlocker(bt.id, props.task.id, props.projectId, props.matterId)
        )
        return null
      })
    setOpenBlocksDialog(false)
    return null
  }

  if (props.viewOnly && zeroStateBlockers && zeroStateDateLink) {
    return (
      <div className={classes.viewOnly}>
        <LinkIcon />
        <Typography
          style={{ marginTop: '4px', marginLeft: '12px' }}
          variant="caption"
        >
          {t('taskLinking.noLinks')}
        </Typography>
      </div>
    )
  }

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <div style={{ display: 'flex' }}>
          {zeroStateBlockers && zeroStateDateLink && (
            <div className={classes.iconWrapper}>
              <LinkIcon />
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {zeroStateDateLink &&
              zeroStateBlockers &&
              !props.viewOnly &&
              showLinks && (
                <TaskLinkButton
                  task={props.task}
                  viewOnly={props.viewOnly}
                  text={t('taskLinking.addDateLinks')}
                  dataTest="add-links"
                  onClick={() => {
                    setOpenLinkDialog(true)
                  }}
                  tooltip={t('taskLinking.tooltipInfo')}
                />
              )}
            {zeroStateBlockers && zeroStateDateLink && !props.viewOnly && (
              <TaskLinkButton
                task={props.task}
                viewOnly={props.viewOnly}
                text={t('taskLinking.addBlockers')}
                dataTest="add-blockers"
                onClick={() => {
                  setOpenBlocksDialog(true)
                }}
                tooltip={t('taskLinking.blockersTooltip')}
              />
            )}
          </div>
        </div>
        {!zeroStateDateLink && showLinks && (
          <div className={classes.buttonWrapper}>
            <DateLinkingIcon />
            <div style={{ marginLeft: '14px' }}>
              <LightButton
                isNotStarted={props.task.status === TASK_STATUS.NOT_STARTED}
                caption={t('taskLinking.datesLinkedTo', {
                  count: props.siblingTaskCount,
                  plural:
                    props.siblingTaskCount === 1
                      ? t('taskLinking.siblingTasks')
                      : t('taskLinking.siblingTasks_other'),
                })}
                viewOnly={props.viewOnly}
                clickHandler={() => {
                  setOpenLinkDialog(true)
                }}
                data-test={'add-links-button'}
              />
            </div>
          </div>
        )}
        {!zeroStateBlockers && (
          <TaskBlockDisplay
            task={props.task}
            block={block}
            blocks={blocks}
            viewOnly={props.viewOnly}
            clickHandler={() => {
              setOpenBlocksDialog(true)
            }}
            zeroStateDateLink={zeroStateDateLink}
          />
        )}
      </div>

      <div style={{ display: 'flex', marginTop: '16px' }}>
        {zeroStateDateLink && !zeroStateBlockers && showLinks && (
          <div className={classes.iconWrapper}>
            <LinkIcon />
          </div>
        )}
        {zeroStateDateLink &&
          !zeroStateBlockers &&
          !props.viewOnly &&
          showLinks && (
            <TaskLinkButton
              task={props.task}
              viewOnly={props.viewOnly}
              text={t('taskLinking.addDateLinks')}
              dataTest="add-links"
              onClick={() => {
                setOpenLinkDialog(true)
              }}
              tooltip={t('taskLinking.tooltipInfo')}
            />
          )}
      </div>

      <div style={{ display: 'flex', marginTop: '8px' }}>
        {zeroStateBlockers && !zeroStateDateLink && (
          <div className={classes.iconWrapper}>
            <LinkIcon />
          </div>
        )}
        {zeroStateBlockers && !zeroStateDateLink && !props.viewOnly && (
          <TaskLinkButton
            task={props.task}
            viewOnly={props.viewOnly}
            text={t('taskLinking.addBlockers')}
            dataTest="add-blockers"
            onClick={() => {
              setOpenBlocksDialog(true)
            }}
            tooltip={t('taskLinking.blockersTooltip')}
          />
        )}
      </div>
      {openLinkDialog === true && editTaskLinkDialog()}
      {openBlocksDialog && (
        <TaskBlockDialog
          task={props.task}
          matterId={props.matterId}
          projectId={props.projectId}
          onClose={() => setOpenBlocksDialog(false)}
          submit={submitBlockers}
        />
      )}
    </div>
  )
}

export default TaskLinksContainer
