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

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Typography, Collapse } from '@mui/material'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { useTableStyles } from './matterCostsTableHelpers'
import { WorkstreamIcon } from '../../../theme/navigation/CommonIcons'
import NewTaskChip from '../../../components/data-display/task-chip/NewTaskChip'
import BigDataSpinner from '../../../components/feedback/big-data-spinner/BigDataSpinner'
import taskService from '../../../services/task/task-service'
import { useDispatch } from 'react-redux'
import { fetchProjects } from '../../matter-details/projects/projects-actions'
import PhaseDateCell from './PhaseDateCell'
import ActiveDaysChip from './ActiveDaysChip'
import { TASK_STATUS, DATE_VARIABLES } from '../../constants'
import JuralioTable from '../../../components/table/JuralioTable'

const PhaseDatesTable = props => {
  const { classes } = useTableStyles()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [showSpinner, setShowSpinner] = useState(true)
  const [workstreams, setWorkstreams] = useState()
  const [tasks, setTasks] = useState()
  const [data, setData] = useState()
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
      flex: 2,
      sortable: false,
      filterable: false,
      renderCell: params => params.row._phase,
    },
    {
      field: 'startDate',
      headerName: t('phaseDates.startDate'),
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: params => params.row._startDate,
    },
    {
      field: 'endDate',
      headerName: t('phaseDates.endDate'),
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: params => params.row._endDate,
    },
    {
      field: 'daysActive',
      headerName: t('phaseDates.daysActive'),
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: params => params.row._daysActive,
    },
  ]

  useEffect(() => {
    setShowSpinner(true)
    taskService.getAllMatterTasks(props.matterId).then(res => {
      if (res.status === 200) {
        setTasks(
          res.body.filter(task => task.status !== TASK_STATUS.NOT_REQUIRED)
        )
        dispatch(fetchProjects(props.matterId, false, false, true)).then(
          res => {
            setWorkstreams(res.projects.sort((a, b) => a.id - b.id))
          }
        )
      }
    })
  }, []) //eslint-disable-line

  useEffect(() => {
    if (tasks && workstreams) {
      setData(prepareData(tasks))
      setShowSpinner(false)
      if (props.setMatterTasks) {
        props.setMatterTasks(tasks)
      }
    }
  }, [tasks, workstreams])

  const prepareData = tasks => {
    return tasks.map((task, index) => {
      const flatTaskList = workstreams.filter(w => w.id === task.projectId)[0]
        .tasks
      return {
        id: task.id,
        _phase: (
          <NewTaskChip
            showDates={false}
            showInteractions={false}
            task={task}
            projectId={task.projectId}
            matterId={props.matterId}
            flatTaskList={flatTaskList}
            showOptions={false}
            allTasks={tasks}
            taskIndex={index}
            setTasks={setTasks}
            showLevelLetter={false}
          />
        ),
        _startDate: (
          <PhaseDateCell
            task={task}
            dateType={DATE_VARIABLES.START}
            matterId={props.matterId}
            allTasks={tasks}
            taskIndex={index}
            setTasks={setTasks}
            flatTaskList={flatTaskList}
          />
        ),
        _endDate: (
          <PhaseDateCell
            task={task}
            dateType={DATE_VARIABLES.END}
            matterId={props.matterId}
            allTasks={tasks}
            taskIndex={index}
            setTasks={setTasks}
            flatTaskList={flatTaskList}
          />
        ),
        _daysActive: (
          <ActiveDaysChip
            task={task}
            durationStart={props.durationStart}
            durationEnd={props.durationEnd}
          />
        ),
        _projectId: task.projectId,
      }
    })
  }

  return (
    <div>
      {showSpinner && <BigDataSpinner size={180} />}
      {!showSpinner && tasks && (
        <>
          {workstreams.map(workstream => {
            return (
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
                    <Typography
                      variant="h6"
                      className={classes.workstreamTitle}
                    >
                      {workstream.name}
                    </Typography>
                  </div>
                )}
                <Collapse in={!collapsedWorkstreams.includes(workstream.id)}>
                  <JuralioTable
                    columns={columns}
                    rows={data.filter(row => row._projectId === workstream.id)}
                    dataTest={'phase-dates' + workstream.id}
                    noRowsText={t('No tasks in workstream')}
                    initialPageSize={100}
                    pageSizeOptions={[100]}
                    hideToolbar
                  />
                </Collapse>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

export default PhaseDatesTable
