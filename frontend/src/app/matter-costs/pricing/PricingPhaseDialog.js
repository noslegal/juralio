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

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Checkbox,
  DialogContent,
  Divider,
  Tooltip,
  Typography,
} from '@mui/material'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import JuralioDialog from '../../../components/dialog/juralio-dialog/JuralioDialog'
import NewTaskChip from '../../../components/data-display/task-chip/NewTaskChip'

const useStyles = makeStyles()(theme => ({
  taskRow: {
    display: 'flex',
  },
  taskContent: {
    marginTop: theme.spacing(1),
    width: '100%',
    display: 'flex',
  },
  segmentLabel: {
    minWidth: '120px',
    fontSize: '0.7rem',
    marginLeft: theme.spacing(0.5),
    marginTop: theme.spacing(0.25),
  },
  workstreamHeader: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
  },
  assignAllButton: {
    marginLeft: theme.spacing(1),
    textTransform: 'none',
    padding: theme.spacing(0.25, 1),
    fontSize: '0.75rem',
  },
}))

const PricingPhaseDialog = props => {
  const { taskList, index, payload } = props
  //when there is 2 pricing types to apply tasks to
  const otherIndex = index === 0 ? 1 : 0
  const { t } = useTranslation()
  const { classes } = useStyles()
  const [selectedTasks, setSelectedTask] = useState(payload[index].taskList)
  const projects = useSelector(state => state.projects.items)

  const handleConfirm = () => {
    const x = [...payload]
    const selectedSet = new Set(selectedTasks)
    if (x.length > 2) {
      taskList.forEach(task => {
        //remove from old
        if (task.index >= 0 && selectedSet.has(task)) {
          x[task.index].taskList = x[task.index].taskList.filter(
            item => item !== task
          )
        }
        //add to new
        if (selectedSet.has(task) && !x[index].taskList.includes(task)) {
          task.index = index
          x[index].taskList.push(task)
        }
      })
    } else {
      taskList.forEach(task => {
        //remove from other tasklist
        if (task.index !== undefined && selectedSet.has(task)) {
          x[task.index].taskList = x[task.index].taskList.filter(
            item => item !== task
          )
        }
        //add non selected tasks to pricing
        if (
          !selectedSet.has(task) &&
          !props.hasTasks &&
          !x[otherIndex].taskList.includes(task)
        ) {
          task.index = otherIndex
          x[otherIndex].taskList.push(task)
          //add selected tasks to pricing
        } else if (selectedSet.has(task) && !x[index].taskList.includes(task)) {
          task.index = index
          x[index].taskList.push(task)
        }
      })
    }
    props.setPayload(x)
    props.setShowTaskDialog(0)
  }

  const isTaskDisabled = task =>
    selectedTasks.includes(task) &&
    props.hasTasks &&
    payload[index].taskList.includes(task)

  const toggleTask = task => {
    let x = [...selectedTasks]
    if (selectedTasks.includes(task)) {
      x = x.filter(item => item !== task)
    } else {
      x.push(task)
    }
    setSelectedTask(x)
  }

  const renderTaskRow = task => {
    const isDisabled = isTaskDisabled(task)
    return (
      <div key={task.id} className={classes.taskRow}>
        <Tooltip title={isDisabled ? t('matterCosts.phaseDialogTooltip') : ''}>
          <div>
            <Checkbox
              data-test="assign-phase-checkbox"
              disabled={isDisabled}
              checked={selectedTasks.includes(task)}
              onChange={() => toggleTask(task)}
            />
          </div>
        </Tooltip>

        <div
          onClick={() => {
            if (!isDisabled) toggleTask(task)
          }}
          className={classes.taskContent}
        >
          <NewTaskChip
            task={task}
            noHover={true}
            showLevelLetter={false}
            displayDates={false}
            compact={true}
            showInteractions={false}
          />
          {!selectedTasks.includes(task) && task.index !== undefined && (
            <Typography className={classes.segmentLabel}>
              {t('matterCosts.phaseInSegment') + (task.index + 1)}
            </Typography>
          )}
        </div>
      </div>
    )
  }

  const uniqueWorkstreamIds = [
    ...new Set(taskList.map(t => t.projectId).filter(id => id != null)),
  ]
  const isMultiWorkstream = uniqueWorkstreamIds.length > 1

  const handleAssignAll = (wsTasks, allSelected) => {
    let x = [...selectedTasks]
    if (allSelected) {
      x = x.filter(t => !wsTasks.includes(t) || isTaskDisabled(t))
    } else {
      wsTasks.forEach(task => {
        if (!isTaskDisabled(task) && !x.includes(task)) {
          x.push(task)
        }
      })
    }
    setSelectedTask(x)
  }

  return (
    <JuralioDialog
      open={true}
      titleText={
        <div>
          <Typography variant="subtitle1">
            {t('matterCosts.phaseDialogTitle') + (index + 1)}
          </Typography>
        </div>
      }
      handleCancel={() => props.setShowTaskDialog(0)}
      onClose={() => props.setShowTaskDialog(0)}
      handleAction={() => handleConfirm()}
      actionLabel={t('common.confirm')}
      disabled={selectedTasks.length === 0}
    >
      <DialogContent>
        {isMultiWorkstream
          ? uniqueWorkstreamIds.map(wsId => {
              const wsProject = projects.find(p => p.id === wsId)
              const wsName = wsProject ? wsProject.name : t('entity.workstream')
              const wsTasks = taskList.filter(t => t.projectId === wsId)
              const nonDisabledTasks = wsTasks.filter(t => !isTaskDisabled(t))
              const allSelected =
                nonDisabledTasks.length > 0 &&
                nonDisabledTasks.every(t => selectedTasks.includes(t))

              return (
                <div key={wsId}>
                  <div className={classes.workstreamHeader}>
                    <Typography variant="subtitle2">{wsName}</Typography>
                    <Button
                      size="small"
                      className={classes.assignAllButton}
                      disabled={nonDisabledTasks.length === 0}
                      onClick={() => handleAssignAll(wsTasks, allSelected)}
                    >
                      {allSelected
                        ? t('matterCosts.removeAll')
                        : t('matterCosts.assignAll')}
                    </Button>
                  </div>
                  <Divider />
                  {wsTasks.map(renderTaskRow)}
                </div>
              )
            })
          : (() => {
              const nonDisabledTasks = taskList.filter(t => !isTaskDisabled(t))
              const allSelected =
                nonDisabledTasks.length > 0 &&
                nonDisabledTasks.every(t => selectedTasks.includes(t))
              return (
                <>
                  <div className={classes.workstreamHeader}>
                    <Button
                      size="small"
                      className={classes.assignAllButton}
                      disabled={nonDisabledTasks.length === 0}
                      onClick={() => handleAssignAll(taskList, allSelected)}
                    >
                      {allSelected
                        ? t('matterCosts.removeAll')
                        : t('matterCosts.assignAll')}
                    </Button>
                  </div>
                  <Divider />
                  {taskList.map(renderTaskRow)}
                </>
              )
            })()}
      </DialogContent>
    </JuralioDialog>
  )
}

export default PricingPhaseDialog
