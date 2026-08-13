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
import PeopleIcon from '@mui/icons-material/People'
import { Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import {
  fetchMatterDetails,
  setMatterDetails,
} from '../../../../app/matter-details/matter-details-actions'
import { setProjectDetails } from '../../../../app/project/project-actions'
import PrivateLozenge from '../../../../components/data-display/private-lozenge/PrivateLozenge'
import { getPostCountAndLabelText } from '../../../../helpers/post-helpers'
import colorModifiers from '../../../../theme/color-modifiers'
import juralioColours from '../../../../theme/juralio-colours'
import {
  MultiplePostsIcon,
  MultipleTasksIcon,
  WorkstreamIcon,
} from '../../../../theme/navigation/CommonIcons'
import rawColours from '../../../../theme/raw-colours'
import { getMatterOverviewUrl } from '../../common/location-context-helper'
import TaskStatusBars from './TaskStatusBars'

const style = makeStyles()(theme => ({
  container: {
    backgroundColor: 'white',
    borderRadius: theme.spacing(2.5),
    width: '90%',
    borderColor: 'rgba(206, 206, 206, 1)',
    borderStyle: 'solid',
    borderWidth: '1px',
    marginLeft: 'auto',
    marginRight: 'auto',
    cursor: 'pointer',
    marginBottom: theme.spacing(2),
    '&:hover': {
      backgroundColor: juralioColours.matterSwitcher.workstreamChip.hover,
    },
    display: 'flex',
    flexDirection: 'column',
    boxShadow: `0px 2px 2px 0px rgba(0, 0, 0, 0.14),
    0px 3px 1px -2px rgba(0, 0, 0, 0.12),
    0px 1px 5px 0px rgba(0, 0, 0, 0.2)`,
  },
  masonryContainer: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    cursor: 'pointer',
    paddingBottom: theme.spacing(1),
    '&:hover': {
      backgroundColor: juralioColours.matterSwitcher.workstreamChip.hover,
    },
    borderRadius: '20px',
  },
  title: {
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
    color: juralioColours.darkText.secondary,
    maxWidth: '80%',
    overflowWrap: 'break-word',
    textOverflow: 'ellipsis',
    fontSize: theme.spacing(2),
    overflow: 'hidden',
    maxHeight: '5em', //added for non-webkit browsers
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical',
  },
  topBar: {
    display: 'flex',
  },
  upwardIcon: {
    width: theme.spacing(1.5),
    height: theme.spacing(2),
    color: juralioColours.darkText.secondary,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  workstreamId: {
    color: juralioColours.darkText.secondary,
    fontSize: theme.spacing(1.5),
    marginTop: '-1px',
    marginBottom: 'auto',
    marginLeft: theme.spacing(0.25),
    marginRight: theme.spacing(0.5),
    height: theme.spacing(2),
  },
  workstreamChipContainer: {
    backgroundColor: juralioColours.named.beige[200],
    borderRadius: theme.spacing(0.5),
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1.25),
    minWidth: theme.spacing(3),
    height: theme.spacing(2),
    display: 'flex',
  },
  containerNoHover: {
    backgroundColor: 'white',
    borderRadius: theme.spacing(0.5),
    width: theme.spacing(38),
    height: theme.spacing(15),
    borderColor: 'rgba(206, 206, 206, 1)',
    borderStyle: 'solid',
    borderWidth: '1px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: theme.spacing(2),
  },
  skeletonTitle: {
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: theme.spacing(10),
    height: theme.spacing(3),
  },
  skeletonTaskCount: {
    marginLeft: 'auto',
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: theme.spacing(5),
  },
  skeletonTaskStatusBar: {
    display: 'flex',
    width: theme.spacing(35),
    height: theme.spacing(2),
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(1),
  },

  helperInstructions: {
    float: 'right',
    marginLeft: 'auto',
    marginRight: theme.spacing(1),
    color: rawColours.primary.primary.main,
    marginBottom: theme.spacing(),
    marginTop: theme.spacing(0.5),
    fontSize: theme.spacing(1.5),
    display: 'flex',
  },
  helperInstructionsIcon: {
    marginTop: 'auto',
    marginBottom: 'auto',
    height: theme.spacing(2),
  },
  overviewWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  masonryOverviewWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewItemWrapper: {
    display: 'flex',
    marginTop: theme.spacing(),
  },
  overviewIcon: {
    height: theme.spacing(2),
    marginRight: theme.spacing(0.5),
    fill: juralioColours.darkText.secondary,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  overviewText: {
    fontSize: theme.spacing(1.5),
    color: juralioColours.darkText.secondary,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  lozenge: {
    marginTop: theme.spacing(0.5),
    marginLeft: 'auto',
    marginRight: theme.spacing(1.25),
  },
  masonryLozenge: {
    marginTop: theme.spacing(0.5),
    marginLeft: 'auto',
  },
}))

const workstreamChip = (id, classes, t) => {
  return (
    <Tooltip title={`${t('entity.workstreamNumber')} ${id}`}>
      <div className={classes.workstreamChipContainer}>
        <WorkstreamIcon className={classes.upwardIcon} />
        <Typography
          className={classes.workstreamId}
          data-test="workstream-chip-id"
        >
          {id}
        </Typography>
      </div>
    </Tooltip>
  )
}

const WorkstreamChip = props => {
  const theme = useTheme()
  const { matter } = props
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'))
  const { classes } = style()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const history = useNavigate()
  let shouldShowExpand = false
  const taskCount = props.workstream.taskCounts
    ? Object.values(props.workstream.taskCounts).reduce((a, b) => a + b) -
      props.workstream.taskCounts.notRequiredCount
    : 0

  const redirect = page => {
    props.handleRedirect()
    dispatch(fetchMatterDetails(matter.id))
    dispatch(setMatterDetails(props.matter))
    dispatch(setProjectDetails(props.workstream))
    if (page === 'matterOverview') {
      history(getMatterOverviewUrl(matter.id))
    } else {
      history(`/matter/${matter.id}/workstream/${props.workstream.id}/${page}`)
    }
  }

  const getTaskStatusBars = () => {
    return (
      <TaskStatusBars
        taskCount={taskCount}
        workstream={props.workstream}
        masonry={props.masonry}
      />
    )
  }

  const handleMouseOver = () => {
    shouldShowExpand = true
    setTimeout(
      () => shouldShowExpand && props.handleMouseOver(props.workstream.id),
      500
    )
  }

  const handleMouseLeave = () => {
    shouldShowExpand = false
    props.handleMouseLeave(props.workstream.id)
  }

  const getInstructions = () => {
    return (
      <Typography
        className={classes.helperInstructions}
        data-test="workstream-chip-instructions"
      >
        {taskCount > 0
          ? t('workstreamChip.goToOverview')
          : t('workstreamChip.clickHereToStart')}
        <ArrowForwardIcon className={classes.helperInstructionsIcon} />
      </Typography>
    )
  }

  const getWorkstreamOverview = () => {
    const postCount = props.workstream.postCount || 0
    const peopleCount = props.workstream.peopleCount || 0
    return (
      <div
        className={
          props.masonry
            ? classes.masonryOverviewWrapper
            : classes.overviewWrapper
        }
      >
        <div className={classes.overviewItemWrapper}>
          <MultipleTasksIcon className={classes.overviewIcon} />
          <Typography
            className={classes.overviewText}
            data-test="workstream-chip-tasks"
          >
            {taskCount} {taskCount === 1 ? t('common.task') : t('common.tasks')}
          </Typography>
        </div>
        <div className={classes.overviewItemWrapper}>
          <PeopleIcon className={classes.overviewIcon} />
          <Typography
            className={classes.overviewText}
            data-test="workstream-chip-people"
          >
            {peopleCount}{' '}
            {peopleCount !== 1 ? t('common.people') : t('common.person')}
          </Typography>
        </div>
        <div className={classes.overviewItemWrapper}>
          <MultiplePostsIcon className={classes.overviewIcon} />
          <Typography
            className={classes.overviewText}
            data-test="workstream-chip-posts"
          >
            {getPostCountAndLabelText(t, postCount)}
          </Typography>
        </div>
      </div>
    )
  }

  const workstreamRefNumber = props.workstream.referenceNumber
    ? props.workstream.referenceNumber.substring(1)
    : '-'
  return (
    <div
      className={props.masonry ? classes.masonryContainer : classes.container}
      onClick={e => {
        if (props.alternateOnClick) {
          props.alternateOnClick(props.workstream.id)
        } else {
          e.stopPropagation()
          if (!isMobileView) {
            if (props.isDefaultWorkstream) {
              redirect('matterOverview')
            } else {
              redirect('overview')
            }
          } else {
            redirect('taskmap')
          }
        }
      }}
      style={
        props.isSelected
          ? {
              marginTop: '8px',
              marginBottom: props.addAdditionalPadding ? '20px' : '8px',
              backgroundColor:
                juralioColours.matterSwitcher.workstreamChip.hover,
              borderRadius: !isMobileView && props.forceHover && '20px',
            }
          : {
              marginTop: '8px',
              marginBottom: props.addAdditionalPadding ? '20px' : '8px',
              backgroundColor:
                !isMobileView &&
                props.forceHover &&
                colorModifiers.hover(rawColours.primary.black[100]),
              borderRadius: !isMobileView && props.forceHover && '20px',
            }
      }
      data-test="matter-switcher-workstream-chip"
      onMouseEnter={handleMouseOver}
      onMouseLeave={handleMouseLeave}
    >
      <div className={classes.topBar}>
        {!props.isDefaultWorkstream &&
          workstreamChip(workstreamRefNumber, classes, t)}
        {!props.isDefaultWorkstream && (
          <Typography
            variant={props.isDefaultWorkstream ? 'overline' : 'body1'}
            className={classes.title}
            data-test="workstream-chip-title"
          >
            {props.workstream.name}
          </Typography>
        )}
        {props.workstream.isPrivate && (
          <div
            className={props.masonry ? classes.masonryLozenge : classes.lozenge}
          >
            <PrivateLozenge />
          </div>
        )}
      </div>
      {getWorkstreamOverview()}
      {getTaskStatusBars()}
      {props.showGoToText && getInstructions()}
    </div>
  )
}

export const SkeletonWorkstreamChip = () => {
  const { classes } = style()
  return (
    <div className={classes.containerNoHover}>
      <div className={classes.topBar}>
        <Skeleton type="text" className={classes.skeletonTitle} />
        <Skeleton type="text" className={classes.skeletonTaskCount} />
      </div>
      <Skeleton type="text" className={classes.skeletonTaskStatusBar} />
    </div>
  )
}
export default WorkstreamChip
