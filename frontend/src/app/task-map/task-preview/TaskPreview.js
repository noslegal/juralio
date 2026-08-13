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

import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import LinkIcon from '@mui/icons-material/Link'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { Fade, IconButton, Typography } from '@mui/material'
import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import TaskRenamePopover from '../../../components/data-display/task-cell/TaskRenamePopover'
import TaskReferenceNumber from '../../../components/data-display/task-reference-number/TaskReferenceNumber'
import CreateNoteFlowContainer from '../../../components/flows/create-note-flow/CreateNoteFlowContainer'
import TaskOperationsMenu from '../../../components/icicle/desktop/menu/TaskOperationsMenu'
import AddButton from '../../../components/inputs/add-button/AddButton'
import UserSearch from '../../../components/inputs/user-search/UserSearch'
import { getTaskDetailsUrl } from '../../../components/navigation/common/location-context-helper'
import SubMenu from '../../../components/navigation/fab-button/subMenu/SubMenu'
import { getPostCountAndLabelText } from '../../../helpers/post-helpers'
import { getDateDisplayString } from '../../../services/helpers/date-helper'
import { getPostTypeIcon } from '../../../services/helpers/post/post-icon-helper'
import { isInImprovedTaskmapContext } from '../../../services/helpers/route/route-context-helper'
import { getTaskCellColour } from '../../../services/helpers/task/task-status-colour-helper'
import { split_text_two_lines } from '../../../services/helpers/text/text-split-helper'
import { addIsActiveOnWorkstream } from '../../../services/helpers/user/user-helper'
import { default as colorModifiers } from '../../../theme/color-modifiers'
import juralioColours from '../../../theme/juralio-colours'
import {
  DateIcon,
  MultiplePostsIcon,
} from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'
import { TASK_CELL_COLOUR, TASK_MENU_CONTEXT } from '../../constants'
import TaskLabelContainer from '../../task-details/task-label/TaskLabelContainer'
import TaskDatePickersContainer from '../../task/TaskDatePickersContainer'

const TASK_CELL_WIDTH = 449

const style = makeStyles()(theme => ({
  wrapper: {
    position: 'absolute',
    width: `${TASK_CELL_WIDTH}px`,
    background: 'red',
    display: 'flex',
    flexDirection: 'column',
    zIndex: theme.zIndex.appBar - 1,
    borderRadius: theme.spacing(0.5),
    boxShadow:
      '0px 5px 5px -3px rgb(0 0 0 / 20%), 0px 8px 10px 1px rgb(0 0 0 / 14%), 0px 3px 14px 2px rgb(0 0 0 / 12%)',
  },
  nameWrapper: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(),
    marginLeft: theme.spacing(),
  },
  taskName: {
    color: juralioColours.darkText.primary,
    marginTop: 'auto',
    marginBottom: 'auto',
    width: theme.spacing(42.5),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  row: {
    display: 'flex',
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(1.5),
    alignItems: 'center',
  },
  rowLeftMargin: {
    display: 'flex',
    marginLeft: theme.spacing(2.5),
    marginBottom: theme.spacing(2),
  },
  rowNoMargin: {
    display: 'flex',
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(1.5),
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(1.5),
  },
  columnWithMargin: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(1.5),
  },
  titleIcon: {
    marginLeft: 'auto',
    cursor: 'pointer',
    height: theme.spacing(2),
    width: theme.spacing(2),
  },
  rowIcon: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
  },
  headerIconWrapper: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 'auto',
    marginRight: theme.spacing(),
    marginTop: theme.spacing(),
  },
  description: {
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: juralioColours.darkText.secondary,
  },
  goToDetailsWrapper: {
    display: 'flex',
    marginLeft: 'auto',
    borderTopLeftRadius: theme.spacing(0.5),
    borderTopRightRadius: theme.spacing(0.5),
    color: 'white',
    cursor: 'pointer',
  },
  gotoArrow: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginRight: theme.spacing(),
    width: theme.spacing(2),
    color: juralioColours.darkText.primary,
  },
  goToText: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: theme.spacing(),
    color: juralioColours.darkText.primary,
  },
  refNumber: {
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  postItem: {
    cursor: 'pointer',
    paddingRight: theme.spacing(),
    width: '80%',
    borderRadius: theme.spacing(0.5),
    marginLeft: theme.spacing(6),
    '&:hover': {
      background: colorModifiers.primaryBackground(
        rawColours.primary.white.primary
      ),
    },
  },
  subText: {
    color: juralioColours.darkText.secondary,
  },
  buttonWrapper: {
    paddingLeft: theme.spacing(5),
  },
}))

const buildPost = (post, task, classes, t, matterId, projectId) => {
  return (
    <div
      key={post.id}
      className={classNames([classes.row, classes.postItem])}
      onClick={() => {
        window.location.href =
          window.location.href.split('#')[0] +
          '#' +
          getTaskDetailsUrl(matterId, projectId, task.id) +
          '/post/' +
          post.id
      }}
      data-test="task-preview-post"
    >
      {getPostTypeIcon(t, post, { height: 24, width: 24 })}
      <div className={classes.column}>
        <Typography>{post.name}</Typography>
        <Typography className={classes.subText}>
          {t('common.created') +
            ' ' +
            getDateDisplayString(post.dateCreated) +
            ' ' +
            t('common.by') +
            ' ' +
            post.creator.firstname +
            ' ' +
            post.creator.lastname}
        </Typography>
      </div>
    </div>
  )
}

const TaskPreview = props => {
  const { classes } = style()
  const { t } = useTranslation()
  const history = useNavigate()
  const task = props.task
  const descriptionSplit =
    task.description && task.description.split('</p>').map(td => td + '</p>')
  const [taskNameLine1, taskNameLine2] = split_text_two_lines(task.name)

  const showDateLinkSummary =
    task.datesLinkedToSiblings && props?.siblingTaskCount > 0
  const showBlockLinkSummary = task?.blockers?.length > 0

  let taskFields = 0
  let minHeight = 350
  let minWidth = TASK_CELL_WIDTH
  if (task.description) {
    taskFields += 1
    minHeight = minHeight + 48
    if (task.description.includes('\n')) {
      minHeight = minHeight + 48
    }
  }
  if (props.posts.length > 0) {
    taskFields += 1
    minHeight = minHeight + Math.min(48 * props.posts.length, 48 * 3)
  }
  if (task.teamMembers && task.teamMembers.length > 0) {
    taskFields += 1
    minHeight = minHeight + 96
  }

  if (showDateLinkSummary || showBlockLinkSummary) {
    taskFields += 1
    minHeight = minHeight + 48
  }

  if (task.labels) {
    taskFields += 1
    minHeight = minHeight + 48
    if (task.labels.length > 3) {
      minHeight = minHeight + 48
      if (task.labels.length > 5) {
        minHeight = minHeight + 48
      }
    }
  }

  let bounds = document
    .getElementById('improved-taskmap-wrapper')
    ?.getBoundingClientRect()

  let top =
    props.position.top + minHeight < window.innerHeight
      ? props.position.top
      : taskFields >= 3
        ? window.innerHeight - minHeight - 48
        : window.innerHeight - minHeight - 24
  let left = props.isMobile
    ? 0
    : props.position.left + TASK_CELL_WIDTH > window.innerWidth
      ? window.innerWidth - TASK_CELL_WIDTH
      : props.position.left
  if (isInImprovedTaskmapContext()) {
    const maxTotalHeight =
      document.getElementById('improved-taskmap-wrapper').scrollTop +
      bounds.height

    const maxTotalWidth =
      document.getElementById('improved-taskmap-wrapper').scrollLeft +
      bounds.width

    top = Math.min(maxTotalHeight, props.position.top)
    left = Math.min(maxTotalWidth, props.position.left)

    if (top + minHeight > maxTotalHeight) {
      top = maxTotalHeight - minHeight
    }
    if (left + minWidth > maxTotalWidth) {
      left = maxTotalHeight - minWidth
    }
  }

  return (
    <Fade in={true}>
      <div
        className={classes.wrapper}
        id="task-preview-popover"
        data-test="task-preview"
        tabIndex="0"
        style={{
          top: top,
          left: left,

          background: getTaskCellColour(task, TASK_CELL_COLOUR.NORMAL),
          maxWidth: '100%',
          borderBottom: `4px solid ${getTaskCellColour(
            task,
            TASK_CELL_COLOUR.FILTERED_IN
          )}`,
        }}
        onClick={e => {
          e.stopPropagation()
        }}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            props.onClose()
          }
        }}
      >
        <div className={classes.row}>
          <div
            className={classes.nameWrapper}
            style={{
              cursor: props.isMatterEditor ? 'pointer' : 'unset',
            }}
            onClick={() => {
              props.isMatterEditor &&
                props.openRename(document.getElementById('task-name-line-1'))
            }}
          >
            <Typography
              variant="subtitle1"
              className={classes.taskName}
              id="task-name-line-1"
              data-test="task-preview-title"
            >
              {taskNameLine1}
            </Typography>
            {taskNameLine2.length > 0 && (
              <Typography variant="subtitle1" className={classes.taskName}>
                {taskNameLine2}
              </Typography>
            )}
          </div>
          <div className={classes.headerIconWrapper}>
            <div className={classes.rowNoMargin}>
              <IconButton
                className={classes.titleIcon}
                onClick={props.onClose}
                size="large"
              >
                <ExpandLessIcon />
              </IconButton>
              <IconButton
                className={classes.titleIcon}
                onClick={e => props.onOptionsClick(e)}
                size="large"
              >
                <MoreVertIcon />
              </IconButton>
            </div>
            <div className={classes.refNumber} onClick={props.copyRefNumber}>
              <TaskReferenceNumber compact task={task} />
            </div>
          </div>
        </div>
        {task.description && (
          <div className={classes.columnWithMargin}>
            {task.description && (
              <Typography
                variant="caption"
                className={classes.description}
                data-test="task-preview-description"
                dangerouslySetInnerHTML={{
                  __html: descriptionSplit[0],
                }}
              ></Typography>
            )}
            {task.description && descriptionSplit.length > 1 && (
              <Typography
                variant="caption"
                className={classes.description}
                dangerouslySetInnerHTML={{
                  __html:
                    descriptionSplit.length > 2
                      ? descriptionSplit[1].slice(
                          0,
                          descriptionSplit[1].length - 4
                        ) +
                        '...' +
                        descriptionSplit[1].slice(
                          descriptionSplit[1].length - 4
                        )
                      : descriptionSplit[1],
                }}
              ></Typography>
            )}
          </div>
        )}
        <div className={classes.rowLeftMargin}>
          <UserSearch
            currentTeam={addIsActiveOnWorkstream(props.taskTeam, props.project)}
            availableUsers={props.availableTeam.filter(
              t =>
                !props.taskTeam.map(u => u.id).includes(t.user.id) &&
                t.user.enabled &&
                (t.teamMemberId !== 0 ||
                  t.matterViewerId > 0 ||
                  t.isPlaceholder)
            )}
            onSelect={props.addTeamMember}
            matterId={props.matterId}
            projectId={props.projectId}
            taskId={task.id}
            handleRemoveUser={props.handleRemoveUser}
            addToAllSubtasks={props.addToAllSubtasks}
            task={task}
            viewOnly={props.viewOnly}
            hideItemRole={true}
            isInPrivateWS={false}
            team={[]}
            showIcon={true}
            showAvatarList={true}
          />
        </div>
        <div className={classes.row}>
          <DateIcon className={classes.rowIcon} />
          <TaskDatePickersContainer task={task} viewOnly={props.viewOnly} />
        </div>
        {showDateLinkSummary || showBlockLinkSummary ? (
          <div className={classes.row}>
            <LinkIcon className={classes.rowIcon} data-test="task-links-icon" />
            <Typography data-test="task-links-summary">
              {showDateLinkSummary
                ? t('taskLinking.summaryDates', {
                    dateCount: props?.siblingTaskCount
                      ? props.siblingTaskCount
                      : 0,
                    pluralDate: props?.siblingTaskCount !== 1 ? 's' : '',
                  })
                : ''}
              {showDateLinkSummary && showBlockLinkSummary ? ', ' : ''}
              {showBlockLinkSummary
                ? t('taskLinking.summaryBlocks', {
                    blockCount: task?.blockers?.length,
                    pluralBlock: task?.blockers?.length !== 1 ? 's' : '',
                  })
                : ''}
            </Typography>
          </div>
        ) : null}
        <div className={classes.row}>
          <TaskLabelContainer
            task={task}
            isTaskPreview={true}
            forceUpdatePreview={props.forceUpdatePreview}
            viewOnly={props.viewOnly}
          />
        </div>
        <div className={classes.row}>
          <MultiplePostsIcon className={classes.rowIcon} />
          <Typography>
            {getPostCountAndLabelText(t, props.posts.length)}
          </Typography>
        </div>
        {props.posts &&
          props.posts
            .slice(0, 3)
            .map(post =>
              buildPost(post, task, classes, t, props.matterId, props.projectId)
            )}
        <div className={classNames(classes.row, classes.buttonWrapper)}>
          <AddButton
            viewOnly={props.viewOnly}
            onClick={props.addPost}
            data-test="task-preview-add-post"
            text={t('taskmapPopover.addPost')}
          />
        </div>
        <div
          className={classes.goToDetailsWrapper}
          style={{
            background: getTaskCellColour(task, TASK_CELL_COLOUR.FILTERED_IN),
          }}
          onClick={() =>
            history(getTaskDetailsUrl(props.matterId, props.projectId, task.id))
          }
          data-test="task-preview-go-to-task-details"
        >
          <Typography className={classes.goToText}>
            {t('taskmapPopover.goToTaskDetails')}
          </Typography>
          <ArrowForwardIcon className={classes.gotoArrow} />
        </div>
        <TaskOperationsMenu
          isTemplate={props.isTemplate}
          handleRenameClick={() => {
            props.openRename(document.getElementById('task-name-line-1'))
          }}
          anchor={props.menuAnchor}
          task={task}
          viewOnly={props.viewOnly}
          matterId={props.matterId}
          onClose={props.closeOptionsMenu}
          isMatterAdmin={props.isMatterAdmin}
          taskMenuContext={TASK_MENU_CONTEXT.TASK_MAP}
        />
        <TaskRenamePopover
          anchor={props.renameAnchor}
          task={task}
          onClose={props.closeRename}
          updateNameHandler={props.renameTask}
        />
        {props.showPostFlow && (
          <CreateNoteFlowContainer
            actionHandler={props.addPost}
            cancelHandler={props.hidePostFlow}
            taskId={task.id}
            type={props.type}
            selectedTaskOverride={task}
            matterId={props.matterId}
            projectId={props.projectId}
          />
        )}
        {props.showSubMenu && (
          <SubMenu
            anchor={props.postAnchor}
            anchorOrigin={{
              vertical: 'bottom',
            }}
            close={() => {
              props.closeSubMenu()
            }}
            select={type => props.setType(type)}
          />
        )}
      </div>
    </Fade>
  )
}

export default TaskPreview
