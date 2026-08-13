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

import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt'
import { Skeleton, Typography } from '@mui/material'
import DialogContent from '@mui/material/DialogContent'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import JuralioDialog from '../../../../components/dialog/juralio-dialog/JuralioDialog'
import taskBlockerService from '../../../../services/task/task-blocker-service'
import {
  BlockedTasksIcon,
  BlockerTasksIcon,
} from '../../../../theme/navigation/CommonIcons'
import { showSnackbar } from '../../../global-snackbar/global-snackbar-actions'
import ExistingTaskBlockListItem, {
  ExistingTaskBlockListItemLoadingState,
} from './TaskBlockComponents/ExistingTaskBlockListItem'
import TaskBlockSelector from './TaskBlockComponents/TaskBlockSelector'
import TaskBlocksToggle from './TaskBlockComponents/TaskBlocksToggle'

const styles = makeStyles()(theme => ({
  container: {
    display: 'grid',
    gridTemplateColumns: 'auto',
    gridTemplateRows: 'auto auto',
    gridTemplateAreas: `'picker''existing'`,
    gap: '0px',
  },
  taskPickerWrapper: {
    gridArea: 'picker',
  },
  existingBlocks: {
    gridArea: 'existing',
    display: 'flex',
    flexDirection: 'column',
    height: '267px',
  },
  blockSelectorContainer: {
    display: 'grid',
    gridAutoColumns: '1fr',
    gridTemplateColumns: '15% 30% 55%',
    gridTemplateRows: 'auto',
    gridTemplateAreas: `'text type selector'`,
    gap: '0px',
  },
  textContainer: {
    gridArea: 'text',
  },
  typeSelectorContainer: {
    gridArea: 'type',
  },
  selectorContainer: {
    gridArea: 'selector',
  },
  thisTask: {
    marginTop: theme.spacing(1.5),
  },
  header: {
    display: 'flex',
    margin: theme.spacing(),
  },
  blockListWrapper: {
    minHeight: '50px',
    overflowY: 'auto',
  },
  blockListWrapperNoItems: {},
  link: { cursor: 'pointer' },
  skeleton: {
    height: theme.spacing(4),
    width: theme.spacing(50),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  icon: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(),
  },
}))

const TaskBlockDialog = props => {
  const { t } = useTranslation()
  const { classes } = styles()
  const [blocks, setBlocks] = useState(true)
  const [blockedTasks, setBlockedTasks] = useState([])
  const [blockerTasks, setBlockerTasks] = useState([])
  const [selectedTasks, setSelectedTasks] = useState([])
  const [validTasks, setValidTasks] = useState([])
  const [hasLoadedTaskBlocks, setHasLoadedTaskBlocks] = useState(false)
  const [existingBlocksToRemove, setExistingBlocksToRemove] = useState([])
  const [hasLoadedValidTasks, setHasLoadedValidTasks] = useState(false)

  const dispatch = useDispatch()

  useEffect(() => {
    setBlockedTasks(
      props.task.blockers
        .filter(tb => tb.blocker.id === props.task.id)
        .map(tb => tb.blocked)
    )
    setBlockerTasks(
      props.task.blockers
        .filter(tb => tb.blocked.id === props.task.id)
        .map(tb => tb.blocker)
    )
    setHasLoadedTaskBlocks(true)
  }, []) //eslint-disable-line

  const removeBlock = (blockerId, blockedId, currentTaskIsBlocker) => {
    const existingBlocks = props.task.blockers.filter(
      block => block.blocker.id === blockerId && block.blocked.id === blockedId
    )

    if (existingBlocks.length > 0) {
      setExistingBlocksToRemove([...existingBlocksToRemove, existingBlocks[0]])
    }
    if (currentTaskIsBlocker) {
      const taskInQuestion = blockedTasks.find(t => t.id === blockedId)
      setSelectedTasks(selectedTasks.filter(t => t.id !== blockedId))
      setBlockedTasks(blockedTasks.filter(t => t.id !== blockedId))
      if (taskInQuestion) {
        setValidTasks([
          ...validTasks.filter(t => t !== taskInQuestion),
          taskInQuestion,
        ])
      }
    } else {
      const taskInQuestion = blockerTasks.find(t => t.id === blockerId)
      setSelectedTasks(selectedTasks.filter(t => t.id !== blockerId))
      setBlockerTasks(blockerTasks.filter(t => t.id !== blockerId))
      if (taskInQuestion) {
        setValidTasks([
          ...validTasks.filter(t => t !== taskInQuestion),
          taskInQuestion,
        ])
      }
    }
  }

  const getMaxHeight = isBlockerList => {
    let defaultHeight = 93
    const blockedTaskCount = blockedTasks.length
    const blockerTaskCount = blockerTasks.length
    if (isBlockerList && blockedTaskCount >= 3) {
      if (blockerTaskCount < 3) {
        return 31 * blockerTaskCount + 'px'
      }
      return defaultHeight + 'px'
    }
    if (!isBlockerList && blockerTaskCount >= 3) {
      if (blockedTaskCount < 3) {
        return 31 * blockedTaskCount + 'px'
      }
      return defaultHeight + 'px'
    }
    if (isBlockerList) {
      const spareTaskSpace = 3 - blockedTaskCount
      return defaultHeight + 31 * spareTaskSpace + 'px'
    } else {
      const spareTaskSpace = 3 - blockerTaskCount
      return defaultHeight + 31 * spareTaskSpace + 'px'
    }
  }

  const loadValidTasks = () => {
    taskBlockerService
      .getValidBlocksForTask(props.task.id, props.projectId, props.matterId)
      .then(res => {
        if (res.status === 200) {
          setHasLoadedValidTasks(true)
          setValidTasks(res.body)
        } else {
          dispatch(showSnackbar(t('taskBlocksDialog.loadError')))
          props.onClose()
        }
      })
  }

  const updatesToApply =
    existingBlocksToRemove.length > 0 ||
    blockerTasks.length +
      blockedTasks.length +
      existingBlocksToRemove.length -
      props.task.blockers.length >
      0

  const blocksRunningTotal = blockerTasks.length + blockedTasks.length
  return (
    <JuralioDialog
      open={true}
      titleText={t('taskBlocksDialog.header')}
      titleIcon={DoNotDisturbAltIcon}
      actionLabel={t('common.confirm')}
      disabled={!updatesToApply}
      handleAction={() => {
        props.submit(existingBlocksToRemove, blockedTasks, blockerTasks)
      }}
      handleCancel={props.onClose}
      onClose={props.onClose}
      style={{ overflow: 'hidden' }}
    >
      <DialogContent
        style={{ position: 'relative', overflow: 'hidden', height: '87%' }}
        data-test="dialog-content"
      >
        <div className={classes.container}>
          <div className={classes.taskPickerWrapper}>
            <div className={classes.blockSelectorContainer}>
              <div className={classes.textContainer}>
                <Typography className={classes.thisTask}>
                  {t('taskBlocksDialog.thisTask')}
                </Typography>
              </div>
              <div className={classes.typeSelectorContainer}>
                <TaskBlocksToggle
                  onChange={() => {
                    setBlocks(!blocks)
                  }}
                  blocks={blocks}
                  task={props.task}
                />
              </div>
              <div className={classes.selectorContainer}>
                <TaskBlockSelector
                  isLoaded={hasLoadedValidTasks}
                  onOpen={() => {
                    if (!hasLoadedValidTasks) {
                      loadValidTasks()
                    }
                  }}
                  validTasks={validTasks}
                  hasLoadedTaskBlocks={hasLoadedTaskBlocks}
                  selectedTasks={selectedTasks}
                  hasMaxedOutBlocks={blocksRunningTotal >= 20}
                  blocks={blocks}
                  setSelectedTasks={tasks => {
                    if (blocks) {
                      setBlockedTasks([...blockedTasks, tasks.at(-1)])
                    } else {
                      setBlockerTasks([...blockerTasks, tasks.at(-1)])
                    }
                    if (existingBlocksToRemove.length > 0) {
                      if (blocks) {
                        const existingBlock = existingBlocksToRemove.find(
                          b => b.blocked.id === tasks.at(-1).id
                        )
                        if (existingBlock) {
                          setExistingBlocksToRemove(
                            existingBlocksToRemove.filter(
                              b => b.blocker.id === tasks.at(-1).id
                            )
                          )
                        }
                      } else {
                        const existingBlock = existingBlocksToRemove.find(
                          b => b.blocker.id === tasks.at(-1).id
                        )

                        if (existingBlock) {
                          setExistingBlocksToRemove(
                            existingBlocksToRemove.filter(
                              b => b.blocked.id === tasks.at(-1).id
                            )
                          )
                        }
                      }
                    }
                    setSelectedTasks(tasks)
                  }}
                />
              </div>
            </div>
          </div>
          <div className={classes.existingBlocks}>
            <div className={classes.header}>
              <BlockerTasksIcon className={classes.icon} />
              {hasLoadedTaskBlocks && (
                <Typography data-test="task-blocker-header">
                  {blockerTasks.length === 0
                    ? t('taskBlocksDialog.noBlockedTitle')
                    : t('taskBlocksDialog.blockedTitle')}
                </Typography>
              )}
              {!hasLoadedTaskBlocks && (
                <Skeleton className={classes.skeleton} />
              )}
            </div>
            <div
              className={
                blockerTasks.length > 0
                  ? classes.blockListWrapper
                  : classes.blockListWrapperNoItems
              }
              style={{
                maxHeight: blockerTasks.length > 0 ? getMaxHeight(true) : '',
              }}
              data-test="blocker-wrapper"
            >
              {blockerTasks.map(task => (
                <ExistingTaskBlockListItem
                  block={task}
                  hideDelete={false}
                  removeBlock={id => removeBlock(id, props.task.id, false)}
                />
              ))}
              {!hasLoadedTaskBlocks &&
                [0, 0].map(() => <ExistingTaskBlockListItemLoadingState />)}
            </div>
            <div className={classes.header}>
              <BlockedTasksIcon className={classes.icon} />
              {hasLoadedTaskBlocks && (
                <Typography data-test="task-blocked-header">
                  {blockedTasks.length === 0
                    ? t('taskBlocksDialog.noBlocksTitle')
                    : t('taskBlocksDialog.blocksTitle')}
                </Typography>
              )}
              {!hasLoadedTaskBlocks && (
                <Skeleton className={classes.skeleton} />
              )}
            </div>
            <div
              className={
                blockedTasks.length > 0
                  ? classes.blockListWrapper
                  : classes.blockListWrapperNoItems
              }
              style={{
                maxHeight: blockedTasks.length > 0 ? getMaxHeight(false) : '',
              }}
              data-test="blocked-wrapper"
            >
              {blockedTasks.map(task => (
                <ExistingTaskBlockListItem
                  block={task}
                  hideDelete={false}
                  removeBlock={id => removeBlock(props.task.id, id, true)}
                />
              ))}
              {!hasLoadedTaskBlocks &&
                [0, 0].map(() => <ExistingTaskBlockListItemLoadingState />)}
            </div>
          </div>
        </div>
      </DialogContent>
    </JuralioDialog>
  )
}
export default TaskBlockDialog
