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

import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import React, { useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import {
  TASK_CELL_COLOUR,
  TASK_MAP_VIEW_MODE_ENUM,
  TASK_STATUS,
} from '../../../app/constants'
import { getTaskCellColour } from '../../../services/helpers/task/task-status-colour-helper'
import juralioColours from '../../../theme/juralio-colours'
import theme from '../../../theme/juralio-theme'
import TaskCellContent from './TaskCellContent'
import TaskCellContentCompact from './TaskCellContentCompact'
import { useSelector } from 'react-redux'

const styles = makeStyles()(theme => ({
  root: {
    boxSizing: 'border-box',
    display: 'flex',
    height: '100%',
    width: '100%',
  },
  taskCell: {
    height: 'calc(100% - 8px)',
    width: 'calc(100% - 4px)',
    zIndex: 1,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
    [theme.breakpoints.down('md')]: {
      height: '100%',
      marginRight: 0,
      marginBottom: 0,
    },
  },
  selectionTaskCell: {
    opacity: '0.5',
  },
  normalTaskCell: {
    opacity: 1.0,
  },
  highlightTaskCell: {
    opacity: 0.9,
  },
  notHighlightTaskCell: {
    opacity: 0.5,
  },
  hover: {
    cursor: 'pointer',
    '&:hover': {
      boxShadow: `0 10px 20px ${juralioColours.taskCell.shadow.bottom}, 0 4px 4px ${juralioColours.taskCell.shadow.top}`,
      transition: 'box-shadow .2s',
      zIndex: 1,
    },
  },
  compactHover: {
    cursor: 'pointer',
    '&:hover': {
      boxShadow: `0 5px 5px ${juralioColours.taskCell.shadow.bottom}, 0 4px 4px ${juralioColours.taskCell.shadow.top}`,
      transition: 'box-shadow .2s',
      zIndex: 1,
    },
  },
  sticky: {
    position: 'sticky',
    height: theme.spacing(8),
  },
  labelIV: {
    color: juralioColours.darkText.primary,
    lineHeight: theme.spacing(2.5),
  },
  nameWrapper: {
    marginBottom: theme.spacing(1.5),
    marginRight: theme.spacing(1.5),
    marginLeft: theme.spacing(1.5),
    marginTop: theme.spacing(),
    width: '100%',
    overflow: 'none',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  optionsDropdown: {
    top: 5,
    right: 0,
    height: theme.spacing(2.5),
    width: theme.spacing(2.5),
    paddingRight: theme.spacing(1.5),
    paddingTop: theme.spacing(1.5),
    marginLeft: theme.spacing(),
    verticalAlign: 'sub',
    display: 'inline',
    color: juralioColours.darkText.primary,
    [theme.breakpoints.down('md')]: { display: 'none' },
  },
}))

const isTemplate = () => window.location.href.includes('/template')

const TaskCell = props => {
  const { classes } = styles()
  const [isHovering, setIsHovering] = useState(false)
  const isMobile = false //seMediaQuery(muiTheme.breakpoints.down('md'))
  const taskMapFilter = useSelector(state => state.taskMapFilter)
  const subtaskCollapsed = taskMapFilter.expandCollapseTaskFilter.includes(
    props.item.id
  )
  const shouldDisplayDates = () => {
    if (window.location.href.includes('/roadmap')) return false
    if (
      props.item.status === TASK_STATUS.DONE &&
      (window.location.href.includes('/taskmap') ||
        window.location.href.includes('/roadmap'))
    )
      return true
    if (props.item.status === TASK_STATUS.NOT_REQUIRED) return false
    if (isTemplate()) return false
    if (props.item.id === -1) return false
    if (isMobile) return false
    if (!props.renderDates) return false
    return true
  }

  const handleCardClick = id => {
    return isTemplate()
      ? props.clickHandler(props.templateId, id)
      : props.clickHandler(props.matterId, props.projectId, id)
  }

  const getHoverClass = () => {
    if (props.compactHeight) {
      return classes.compactHover
    }
    return (
      props.item.level &&
      props.isAboveHeightThreshold &&
      !props.hideHover &&
      classes.hover
    )
  }

  const getOpacityClass = () =>
    props.selectionMode && !props.isHighlighted ? classes.selectionTaskCell : ''

  const getHighlightClass = () => {
    switch (props.colourMode) {
      case TASK_CELL_COLOUR.FILTERED_OUT:
        return classes.notHighlightTaskCell
      case TASK_CELL_COLOUR.FILTERED_IN:
        return classes.highlightTaskCell
      case TASK_CELL_COLOUR.NORMAL:
        return classes.normalTaskCell
      default:
        return ''
    }
  }

  const renderTaskContent = () => {
    if (!props.displayContent) {
      return
    }
    const isNotRequired = props.item.status === TASK_STATUS.NOT_REQUIRED
    return props.isAboveHeightThreshold && props.item.level ? (
      <TaskCellContent
        isNotRequired={isNotRequired}
        isDisplayingDates={shouldDisplayDates()}
        isReadOnly={props.isReadOnly}
        isMobile={isMobile}
        classes={props.classes}
        item={props.item}
        selectedTask={props.selectedTask}
        id={props.selectedTask?.id}
        handleOptionsClick={props.handleOptionsClick}
        isTemplate={isTemplate}
        showOptions={props.showOptions}
        isRoadmap={window.location.href.includes('/roadmap')}
        colourMode={props.colourMode}
        selectionMode={props.selectionMode}
        detailedView={props.detailedView}
        viewOnly={props.viewOnly}
        handleNameClick={props.handleNameClick}
        handlePreviewClick={props.handlePreviewClick}
        handleDateClick={props.handleDateClick}
        isPlaceHolderElement={props.item.id === -1}
        isHovering={isHovering}
      />
    ) : null
  }

  const renderTaskContentCompact = () => {
    if (!props.displayContent) {
      return
    }
    if (props.detailedView?.viewMode === TASK_MAP_VIEW_MODE_ENUM.COMPACT) {
      return renderTaskContent()
    }
    return (
      <TaskCellContentCompact
        isReadOnly={props.isReadOnly}
        item={props.item}
        isTemplate={isTemplate}
        handleOptionsClick={props.handleOptionsClick}
        showOptions={props.showOptions}
        viewOnly={props.viewOnly}
        renderDates={props.renderDates}
        handlePreviewClick={props.handlePreviewClick}
      />
    )
  }

  const getOpacity = () => {
    if (props.selectionMode && !props.isHighlighted) {
      return '0.5'
    }
    return props.isSelected ? '0.75' : 1
  }

  const getTaskHeight = () => {
    if (props.noMargin) {
      return '100%'
    }
    if (
      props.detailedView?.viewMode === TASK_MAP_VIEW_MODE_ENUM.DETAILED &&
      subtaskCollapsed
    ) {
      return '210px'
    }
    if (
      props.detailedView?.viewMode === TASK_MAP_VIEW_MODE_ENUM.COMPACT &&
      subtaskCollapsed
    ) {
      return '94px'
    }

    if (
      props.detailedView?.viewMode === TASK_MAP_VIEW_MODE_ENUM.STANDARD &&
      subtaskCollapsed
    ) {
      return '174px'
    }

    return '100%'
  }

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <div className={classes.root}>
          <div
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => {
              if (props.item.id !== -1) {
                handleCardClick(props.item.id)
              }
            }}
            className={`${
              classes.taskCell
            } ${getHoverClass()} ${getOpacityClass()} ${getHighlightClass()}`}
            style={{
              zIndex: props.item.id === -1 ? 100 : 1,
              borderLeft: 'solid 4px',
              borderColor: props.item.isDeliverable
                ? getTaskCellColour(props.item, TASK_CELL_COLOUR.FILTERED_IN)
                : getTaskCellColour(props.item, props.colourMode),
              backgroundColor: props.disableBackgroundColor
                ? ''
                : getTaskCellColour(props.item, props.colourMode),
              opacity: getOpacity(),
              minHeight: subtaskCollapsed
                ? getTaskHeight()
                : props.compactHeight
                  ? theme.spacing(3)
                  : theme.spacing(10),
              marginRight: props.noMargin ? '0px' : '',
              marginBottom: props.noMargin ? '0px' : '',
              width: props.noMargin ? '100%' : '',
              height: subtaskCollapsed ? 'auto' : getTaskHeight(),
              paddingBottom: subtaskCollapsed ? '8px' : '0px',
            }}
            data-test="task-cell-test"
            data-task-cell
          >
            {props.compactHeight
              ? renderTaskContentCompact(props.isReadOnly)
              : renderTaskContent(props.isReadOnly)}
          </div>
        </div>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

export default TaskCell
