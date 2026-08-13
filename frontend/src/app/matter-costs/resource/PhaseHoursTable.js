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

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Typography, Tooltip, Collapse } from '@mui/material'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { useTableStyles } from './matterCostsTableHelpers'
import { WorkstreamIcon } from '../../../theme/navigation/CommonIcons'
import NewTaskChip from '../../../components/data-display/task-chip/NewTaskChip'
import BigDataSpinner from '../../../components/feedback/big-data-spinner/BigDataSpinner'
import taskService from '../../../services/task/task-service'
import { useDispatch } from 'react-redux'
import { fetchProjects } from '../../matter-details/projects/projects-actions'
import PhaseHourField from './PhaseHourField'
import ActiveDaysChip from './ActiveDaysChip'
import { TASK_STATUS } from '../../constants'
import { filterValidTasks } from '../outcomes/revenueHelper'
import JuralioTable from '../../../components/table/JuralioTable'

const PhaseHoursTable = props => {
  const {
    matterId,
    fullPeriod,
    setPhaseHourPayload,
    data,
    durationStart,
    durationEnd,
  } = props
  const { classes } = useTableStyles()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [showSpinner, setShowSpinner] = useState(true)
  const [workstreams, setWorkstreams] = useState()
  const [tasks, setTasks] = useState()
  const [payload, setPayload] = useState()
  const [tableData, setTableData] = useState()
  const [collapsedWorkstreams, setCollapsedWorkstreams] = useState([])

  const toggleWorkstream = id => {
    setCollapsedWorkstreams(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const columns = [
    {
      field: 'phase',
      headerName: t('phaseDates.phase'),
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: params => params.row._phase,
    },
    {
      field: 'daysActive',
      headerName: t('phaseDates.daysActive'),
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: params => params.row._daysActive,
    },
    {
      field: 'hours',
      headerName: t('phaseHours.hours'),
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: params => params.row._hours,
    },
  ]

  useEffect(() => {
    setShowSpinner(true)
    taskService.getAllMatterTasks(matterId).then(res => {
      if (res.status === 200) {
        const allTasks = res.body.filter(
          task => task.status !== TASK_STATUS.NOT_REQUIRED
        )
        setTasks(allTasks)
        const validTasks = filterValidTasks(
          res.body,
          fullPeriod.startDate,
          fullPeriod.endDate
        )
        initPayload(validTasks)
        dispatch(fetchProjects(matterId, false, false, true)).then(res => {
          setWorkstreams(res.projects.sort((a, b) => a.id - b.id))
        })
      }
    })
  }, []) //eslint-disable-line

  useEffect(() => {
    if (tasks && workstreams && payload) {
      setTableData(prepareData(tasks))
      setShowSpinner(false)
    }
    //eslint-disable-next-line
  }, [tasks, workstreams, payload])

  const initPayload = validTasks => {
    const p = validTasks.map(task => {
      const existingCte = data.costTimeEstimateList?.find(
        cte => cte.taskId === task.id
      )
      return {
        taskId: task.id,
        wsId: task.projectId,
        hour_value: existingCte
          ? (existingCte.hourValue ?? existingCte.hour_value ?? null)
          : null,
        projectionPeriod: fullPeriod.id,
      }
    })
    setPayload(p)
    setPhaseHourPayload(p)
  }

  const updatePayload = (value, index, taskId) => {
    let x = payload
    let taskToUpdate = x.find(y => y.taskId === taskId)
    if (!taskToUpdate) return
    index = x.indexOf(taskToUpdate)
    x[index].hour_value = parseInt(value)
    setPayload(x)
    setPhaseHourPayload(x)
    setTableData(prepareData(tasks))
  }

  const prepareData = tasks => {
    return tasks.map((task, index) => {
      const isDisabled =
        filterValidTasks([task], fullPeriod.startDate, fullPeriod.endDate)
          .length === 0
      const flatTaskList = workstreams.filter(w => w.id === task.projectId)[0]
        .tasks
      const payloadEntry = payload?.find(x => x.taskId === task.id)
      const hourValue = payloadEntry ? (payloadEntry.hour_value ?? 0) : 0

      return {
        id: task.id,
        _phase: (
          <NewTaskChip
            showDates={false}
            showInteractions={false}
            showDatesInline={true}
            task={task}
            projectId={task.projectId}
            matterId={matterId}
            flatTaskList={flatTaskList}
            showOptions={false}
            allTasks={tasks}
            taskIndex={index}
            setTasks={setTasks}
            showLevelLetter={false}
          />
        ),
        _daysActive: (
          <ActiveDaysChip
            task={task}
            durationStart={durationStart}
            durationEnd={durationEnd}
          />
        ),
        _hours: (
          <Tooltip
            title={t('phaseHours.disabledTooltip')}
            disableHoverListener={!isDisabled}
            disableFocusListener={!isDisabled}
          >
            <span>
              <PhaseHourField
                index={index}
                autoFocus={index === 0 && !isDisabled}
                value={hourValue}
                updatePayload={updatePayload}
                viewOnly={isDisabled}
                skip={!payloadEntry}
                taskId={task.id}
              />
            </span>
          </Tooltip>
        ),
        _projectId: task.projectId,
      }
    })
  }

  return (
    <div>
      {showSpinner && <BigDataSpinner size={180} />}
      {!showSpinner && tasks && workstreams && (
        <>
          {workstreams.map(workstream => (
            <div key={workstream.id} className={classes.tableContainer}>
              {workstreams.length > 1 && (
                <div
                  className={classes.workstreamHeader}
                  onClick={() => toggleWorkstream(workstream.id)}
                >
                  {collapsedWorkstreams.includes(workstream.id) ? (
                    <ExpandMore />
                  ) : (
                    <ExpandLess />
                  )}
                  <WorkstreamIcon />
                  <Typography variant="h6" className={classes.workstreamTitle}>
                    {workstream.name}
                  </Typography>
                </div>
              )}
              <Collapse in={!collapsedWorkstreams.includes(workstream.id)}>
                <JuralioTable
                  columns={columns}
                  rows={tableData.filter(
                    row => row._projectId === workstream.id
                  )}
                  dataTest={'phase-hours-' + workstream.id}
                  noRowsText={t('No tasks in workstream')}
                  initialPageSize={100}
                  pageSizeOptions={[100]}
                  hideToolbar
                />
              </Collapse>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default PhaseHoursTable
