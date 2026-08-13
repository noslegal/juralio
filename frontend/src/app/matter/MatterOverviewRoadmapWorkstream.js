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

import ArrowForward from '@mui/icons-material/ArrowForward'
import { Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import PrivateLozenge from '../../components/data-display/private-lozenge/PrivateLozenge'
import { getOverviewUrl } from '../../components/navigation/common/location-context-helper'
import { sendTextToClipboard } from '../../services/clipboard/clipboard-service'
import colorModifiers from '../../theme/color-modifiers'
import { WorkstreamIcon } from '../../theme/navigation/CommonIcons'
import rawColours from '../../theme/raw-colours'
import { showSnackbar } from '../global-snackbar/global-snackbar-actions'
import MilestoneChips from '../project/overview/items/MilestoneChips'
import ProjectOverviewRoadmapRender from '../project/overview/items/ProjectOverviewRoadmapRender'

const style = makeStyles()(theme => ({
  root: { width: '100%' },
  header: {
    display: 'flex',
    flexDirection: 'row',
    height: theme.spacing(7),
    alignItems: 'center',
    backgroundColor: rawColours.overview.matterSecondary,
  },
  icon: {
    color: colorModifiers.primaryText(rawColours.primary.black[200]),
    marginLeft: theme.spacing(0.5),
    height: theme.spacing(2),
    width: theme.spacing(2),
  },
  refNumber: {
    marginRight: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5),
    color: colorModifiers.primaryText(rawColours.primary.black[200]),
    fontSize: theme.spacing(1.5),
  },
  matterName: {
    color: rawColours.primary.black.black,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  displayWrapper: {
    overflow: 'hidden',
    width: '100%',
    height: theme.spacing(12.5),
  },
  matterNameText: {
    fontSize: theme.spacing(2),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  lozenge: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: colorModifiers.rowOpacity(rawColours.text.black),
    borderRadius: theme.spacing(0.5),
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
    height: theme.spacing(3),
    alignItems: 'center',
    cursor: 'pointer',
  },
  goToOverview: {
    marginLeft: 'auto',
    fontSize: theme.spacing(1.5),
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing(),
    marginRight: theme.spacing(),
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    cursor: 'pointer',
    borderRadius: theme.spacing(0.5),
    '&:hover': {
      backgroundColor: colorModifiers.secondaryBackground(
        rawColours.primary.grey[200]
      ),
    },
  },
  goToOverviewIcon: {
    height: theme.spacing(2),
    width: theme.spacing(2),
  },
}))

const MatterOverviewRoadmapWorkstream = props => {
  const { classes } = style()
  const history = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const onTitleClick = () => {
    history(getOverviewUrl(props.matterId, props.workstream.id))
  }

  const dates = [
    props.workstream.startDate,
    props.workstream.endDate,
    !props.workstream.startDate,
    !props.workstream.endDate,
  ]
  const noDates = !props.workstream.startDate && !props.workstream.endDate
  const doneChildrenCount = props.workstream.taskCounts.doneCount
  const inProgressChildrenCount = props.workstream.taskCounts.inProgressCount
  const notStartedChildrenCount = props.workstream.taskCounts.notStartedCount

  const lozenge = () => {
    return (
      <div
        className={classes.lozenge}
        onClick={() => {
          sendTextToClipboard(
            window.location.href.split('overview')[0] +
              'workstream/' +
              props.workstream.id +
              '/overview'
          )

          dispatch(showSnackbar(t('taskDetails.urlOfTaskCopiedToClipbard')))
        }}
      >
        <WorkstreamIcon className={classes.icon} />
        <Typography variant="body2" className={classes.refNumber}>
          {props.workstream.referenceNumber.slice(1)}
        </Typography>
      </div>
    )
  }

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        {lozenge()}

        <div className={classes.matterName} onClick={onTitleClick}>
          <Typography
            className={classes.matterNameText}
            data-test="matter-overview-workstream-title"
          >
            {props.workstream.name}
          </Typography>
        </div>
        {props.workstream.isPrivate && <PrivateLozenge />}
        <Typography
          className={classes.goToOverview}
          onClick={onTitleClick}
          data-test="go-to-workstream-overview"
        >
          {t('matterOverview.goToWorkstream')}
          <ArrowForward className={classes.goToOverviewIcon} />
        </Typography>
      </div>
      <div className={classes.displayWrapper}>
        <ProjectOverviewRoadmapRender
          noDatesSet={noDates}
          navigateToTask={onTitleClick}
          dates={dates}
          earliestDate={props.earliestDate}
          latestDate={props.latestDate}
          workstream={props.workstream}
          isMatterOverview={true}
          shouldIncludeTodaysDate={false}
        />
        <MilestoneChips
          workstream={props.workstream}
          earliestDate={props.earliestDate}
          latestDate={props.latestDate}
          isMatterOverview={true}
        />
      </div>
    </div>
  )
}

export default MatterOverviewRoadmapWorkstream
