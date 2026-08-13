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

import { makeStyles } from 'tss-react/mui'
import { Paper, Typography, useMediaQuery, useTheme } from '@mui/material'
import ListBreadCrumb from './ListBreadCrumb'
import TaskCell from '../../data-display/task-cell/TaskCell'
import { useDispatch, useSelector } from 'react-redux'
import {
  closeOptionsMenu,
  openPreview,
  requestOptionsMenu,
  requestTaskRename,
} from '../../../redux/ducks/improved-taskmap-interactions'
import { useEffect, useState } from 'react'
import TaskMenuContainer from '../../../app/task-details/task-card-header/task-option-menu/TaskMenuContainer'
import { TASK_MENU_CONTEXT } from '../../../app/constants'
import {
  getMatterIdFromLocation,
  getTaskDetailsUrl,
  isInTemplate,
} from '../../navigation/common/location-context-helper'
import { useLocation, useNavigate } from 'react-router'
import rawColours from '../../../theme/raw-colours'
import TaskCellAssigneeChip from '../../data-display/task-cell/TaskCellAssigneeChip'
import juralioColours from '../../../theme/juralio-colours'
import { showTaskPreview } from '../../../app/task-details/task-actions'
import TemplateMenuContainer from '../../../app/task-details/task-card-header/template-option-menu/TemplateMenuContainer'
import { useIsViewOnly } from '../../../hooks/matter/viewer/matter-viewer-hooks'

const useStyles = makeStyles()(theme => ({
  parentText: {
    color: juralioColours.darkText.disabled,
    marginLeft: theme.spacing(0.5),
  },
  grid: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '85% 5% 10%',
    alignItems: 'center',
  },
  subtaskCountContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    marginTop: theme.spacing(2.5),
  },
  donePip: {
    backgroundColor: rawColours.status.done.dark,
    width: theme.spacing(1),
    height: theme.spacing(1),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  inProgressPip: {
    backgroundColor: rawColours.status.inProgress.dark,
    width: theme.spacing(1),
    height: theme.spacing(1),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  notStartedPip: {
    backgroundColor: rawColours.status.notStarted.dark,
    width: theme.spacing(1),
    height: theme.spacing(1),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  taskCountForTab: {
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  paper: {
    borderBottom: '1px solid #EAECF0',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    backgroundColor: '#F9FAFB',
    '&:hover': {
      backgroundColor: '#F2F4F7',
    },
  },
}))

const ListTaskItem = props => {
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'))
  const dispatch = useDispatch()
  const { task, parent, workstreamId } = props
  const { classes } = useStyles()
  const [showOptions, setShowOptions] = useState(false)
  const [anchorEl, setanchorEl] = useState(null)
  const location = useLocation()
  const matterId = getMatterIdFromLocation(location)
  const history = useNavigate()
  const isTemplate = isInTemplate(window.location.href)
  const matterDetails = useSelector(state => state.matterDetails)
  const isViewOnly = useIsViewOnly(matterDetails.matter)
  const handleOptionsClick = e => {
    setanchorEl(e.currentTarget)
    setShowOptions(true)
    dispatch(requestOptionsMenu(task.id))
  }
  const [subtaskCounts, setSubtaskCounts] = useState()

  useEffect(() => {
    let countObj = { ns: 0, ip: 0, d: 0, total: 0 }
    props.subtasks.forEach(subtask => {
      switch (subtask.status) {
        case 'not-started':
          countObj.ns += 1
          countObj.total += 1
          break
        case 'in-progress':
          countObj.ip += 1
          countObj.total += 1
          break
        case 'done':
          countObj.d += 1
          countObj.total += 1
          break
        default:
          break
      }
    })
    setSubtaskCounts(countObj)
    //eslint-disable-next-line
  }, [])

  const handleClick = task => {
    history(getTaskDetailsUrl(matterId, workstreamId, task.id))
  }

  const handlePreviewClick = e => {
    e.stopPropagation()
    let cell = document.getElementById(`taskcell-${task.id}`)
    let left = 0
    let top = 0
    if (cell) {
      let bounds = cell.getBoundingClientRect()
      left = bounds.x
      top = bounds.top - 107
    }
    dispatch(showTaskPreview(task, { left: left, top: top }, false))
    dispatch(openPreview(task.id))
  }

  return (
    <>
      <Paper
        elevation={0}
        id={`task-cell-name-${props.task?.id}`}
        className={classes.paper}
        style={
          props.isDragging ? { backgroundColor: 'rgba(105, 56, 239, 0.4)' } : {}
        }
      >
        <div style={{ display: 'flex' }}>
          <div
            style={{
              marginLeft: '12px',
              marginTop: '20px',
              width: '95px',
              alignContent: 'center',
            }}
          >
            <ListBreadCrumb
              level={task.level}
              maxLevel={task.level}
              task={task}
            />
          </div>
          <div className={classes.grid}>
            <div id={'taskcell-' + task.id}>
              <Typography variant="subtitle2" className={classes.parentText}>
                {parent?.name}
              </Typography>
              <TaskCell
                matterId={matterId}
                item={task}
                interactive={true}
                isAboveHeightThreshold={true}
                handleOptionsClick={handleOptionsClick}
                renderDates={true}
                isReadOnly={isViewOnly}
                viewOnly={isViewOnly}
                compactHeight={true}
                detailedView={true}
                clickHandler={() => handleClick(task)}
                handlePreviewClick={handlePreviewClick}
                projectId={workstreamId}
                selectedTask={null}
                showOptions={true}
                hideHover={false}
                disableBackgroundColor={false}
                displayContent={true}
                handleDateClick={() => {}}
              />
            </div>
            <div className={classes.subtaskCountContainer}>
              {subtaskCounts?.total > 0 && !isSmallScreen && (
                <div style={{ display: 'flex' }}>
                  <div style={{ display: 'flex' }}>
                    <div
                      style={subtaskCounts.ns === 0 ? { opacity: 0.4 } : {}}
                      className={classes.notStartedPip}
                    />
                    <Typography
                      style={subtaskCounts.ns === 0 ? { opacity: 0.4 } : {}}
                      data-test="not-started-tasks"
                      className={classes.taskCountForTab}
                    >
                      {subtaskCounts.ns}
                    </Typography>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <div
                      style={subtaskCounts.ip === 0 ? { opacity: 0.4 } : {}}
                      className={classes.inProgressPip}
                    />
                    <Typography
                      style={subtaskCounts.ip === 0 ? { opacity: 0.4 } : {}}
                      data-test="in-progress-tasks"
                      className={classes.taskCountForTab}
                    >
                      {subtaskCounts.ip}
                    </Typography>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <div
                      style={subtaskCounts.d === 0 ? { opacity: 0.4 } : {}}
                      className={classes.donePip}
                    />
                    <Typography
                      style={subtaskCounts.d === 0 ? { opacity: 0.4 } : {}}
                      data-test="done-tasks"
                      className={classes.taskCountForTab}
                    >
                      {subtaskCounts.d}
                    </Typography>
                  </div>
                </div>
              )}
            </div>
            <div
              style={{ marginTop: '16px', marginRight: '12px' }}
              id={`list-item-${task.id}-team-chip`}
            >
              {!isTemplate && (
                <TaskCellAssigneeChip
                  assignees={task.teamMembers}
                  isSelected={props.selectedTask && task.id === props.id}
                  taskStatus={task.status}
                  task={task}
                  viewOnly={isViewOnly}
                  isReadOnly={isViewOnly}
                  colourMode={props.colourMode}
                  taskId={task.id}
                />
              )}
            </div>
            {showOptions && !isTemplate && (
              <TaskMenuContainer
                anchor={anchorEl}
                closeHandler={() => {
                  setShowOptions(false)
                  dispatch(closeOptionsMenu(false))
                }}
                matterId={props.matterId}
                task={task}
                taskMenuContext={TASK_MENU_CONTEXT.TASK_HEADER}
                hideRename={true}
                dontRedirect={true}
                updateProject={() => {}}
                viewOnly={isViewOnly}
              />
            )}
            {showOptions && isTemplate && (
              <TemplateMenuContainer
                handleRenameClick={() => {
                  setShowOptions(false)
                  dispatch(closeOptionsMenu(false))
                  dispatch(requestTaskRename(props.task.id))
                }}
                taskMenuContext={TASK_MENU_CONTEXT.TASK_MAP}
                task={task}
                anchor={anchorEl}
                closeHandler={() => {
                  setShowOptions(false)
                  dispatch(closeOptionsMenu(false))
                }}
              />
            )}
          </div>
        </div>
      </Paper>
    </>
  )
}
export default ListTaskItem
