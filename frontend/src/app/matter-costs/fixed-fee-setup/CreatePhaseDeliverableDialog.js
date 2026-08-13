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

import React, { useMemo, useState } from 'react'
import { DialogContent, TextField, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import JuralioDialog from '../../../components/dialog/juralio-dialog/JuralioDialog'
import TaskSelectBase from '../../../components/inputs/task-select/base/TaskSelectBase'
import JurDeliverable from '../../../assets/images/JurDeliverable'
import taskService from '../../../services/task/task-service'
import rawColours from '../../../theme/raw-colours'
import {
  CONFIG,
  MAX_FIELD_LENGTHS,
  TASK_MAP_LEVELS,
  TASK_STATUS,
} from '../../constants'

const useStyles = makeStyles()(theme => ({
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  fieldLabel: {
    fontSize: 13,
    color: rawColours.primary.black[100],
    marginBottom: theme.spacing(0.5),
  },
  titleIconWrapper: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& svg': { width: '100%', height: '100%' },
    '& path': { strokeWidth: 1.5 },
  },
  errorText: {
    color: rawColours.primary.red.primary,
    fontSize: 13,
  },
}))

const cannotAcceptChild = task => {
  if (task.status === TASK_STATUS.NOT_REQUIRED) return true
  if (task.isMilestone) return true
  if ((task.tasks?.length || 0) >= CONFIG.SUBTASK_LIMIT) return true
  if (task.level >= TASK_MAP_LEVELS.F) return true
  return false
}

const CreatePhaseDeliverableDialog = ({
  open,
  phase,
  matterId,
  onClose,
  onCreated,
}) => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [selectedTask, setSelectedTask] = useState(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const subtree = useMemo(() => {
    const collect = task => [task, ...(task.tasks || []).flatMap(collect)]
    return phase?.taskRaw ? collect(phase.taskRaw) : []
  }, [phase])

  const performSearch = input => {
    const term = input.trim().toLowerCase()
    return Promise.resolve(
      term
        ? subtree.filter(task => task.name?.toLowerCase().includes(term))
        : subtree
    )
  }

  const canSubmit =
    !creating &&
    name.trim().length > 0 &&
    selectedTask != null &&
    !cannotAcceptChild(selectedTask)

  const reset = () => {
    setName('')
    setError('')
    setSelectedTask(null)
  }

  const handleCancel = () => {
    if (creating) return
    reset()
    onClose()
  }

  const handleAction = () => {
    if (!canSubmit) return
    setCreating(true)
    setError('')
    taskService
      .createTask(
        matterId,
        phase.workstreamId,
        selectedTask.id,
        selectedTask.status,
        name.trim(),
        false,
        true
      )
      .then(res => {
        if (res?.status === 201) {
          reset()
          onCreated(res.body)
        } else {
          setError(
            res?.body?.message ||
              t('fixedFeeSetup.step3.createDeliverable.createError')
          )
        }
      })
      .catch(() =>
        setError(t('fixedFeeSetup.step3.createDeliverable.createError'))
      )
      .finally(() => setCreating(false))
  }

  const titleIcon = () => (
    <span className={classes.titleIconWrapper}>
      <JurDeliverable />
    </span>
  )

  return (
    <JuralioDialog
      open={open}
      onClose={handleCancel}
      titleText={t('fixedFeeSetup.step3.createDeliverable.title', {
        phase: phase?.name || '',
      })}
      titleIcon={titleIcon}
      actionLabel={t('fixedFeeSetup.step3.createDeliverable.create')}
      handleAction={handleAction}
      handleCancel={handleCancel}
      disabled={!canSubmit}
      showLoadingBar={creating}
      usageContext="CreatePhaseDeliverableDialog"
    >
      <DialogContent>
        <div className={classes.body}>
          <div>
            <Typography component="div" className={classes.fieldLabel}>
              {t('fixedFeeSetup.step3.createDeliverable.nameLabel')}
            </Typography>
            <TextField
              data-test="deliverable-name-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t(
                'fixedFeeSetup.step3.createDeliverable.namePlaceholder'
              )}
              fullWidth
              autoFocus
              slotProps={{
                htmlInput: { maxLength: MAX_FIELD_LENGTHS.POST_NAME },
              }}
            />
          </div>
          <div>
            <Typography component="div" className={classes.fieldLabel}>
              {t('fixedFeeSetup.step3.createDeliverable.destinationLabel')}
            </Typography>
            <TaskSelectBase
              performSearch={performSearch}
              selectedTask={selectedTask}
              placeholder={t(
                'fixedFeeSetup.step3.createDeliverable.destinationPlaceholder'
              )}
              onChange={task => task && setSelectedTask(task)}
              disabledItemFilter={cannotAcceptChild}
            />
          </div>
          {error && (
            <Typography component="div" className={classes.errorText}>
              {error}
            </Typography>
          )}
        </div>
      </DialogContent>
    </JuralioDialog>
  )
}

export default CreatePhaseDeliverableDialog
