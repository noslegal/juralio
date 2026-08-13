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

import { ArrowForward, KeyboardArrowRight } from '@mui/icons-material'
import { Button, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { makeStyles } from 'tss-react/mui'
import TaskChip from '../../../components/data-display/task-chip/TaskChip'
import { getMatterOverviewUrl } from '../../../components/navigation/common/location-context-helper'
import colorModifiers from '../../../theme/color-modifiers'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'
import { MattersIcon } from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'

const style = makeStyles()(theme => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expand: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: theme.spacing(1.25),
    marginTop: theme.spacing(2),
    cursor: 'pointer',
    width: 'fit-content',
    maxWidth: '370px',
  },
  taskChipRow: {
    margin: theme.spacing(2),
  },
  matterIcon: {
    margin: theme.spacing(0.5),
  },
  linkText: {
    marginTop: 'auto',
    marginBottom: 'auto',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  expandedIcon: {
    color: colorModifiers.textBackground(rawColours.primary.black.black),
    marginTop: theme.spacing(0.5),
    transition: 'transform .5s ease-in-out',
    transform: 'rotate(90deg)',
  },
  collapsedIcon: {
    color: colorModifiers.textBackground(rawColours.primary.black.black),
    marginTop: theme.spacing(0.5),
    transition: 'transform .25s ease-in-out',
  },
  hidden: {
    height: 0,
    overflow: 'hidden',
    transition: 'height .25s',
  },
  goToMatterButton: {
    textTransform: 'none',
    marginRight: theme.spacing(1.25),
    marginTop: theme.spacing(2),
    display: 'flex',
    color: JuralioNamedColours.blue.main,
  },
}))

const RecentlyViewedMatter = props => {
  const { classes } = style()
  const { t } = useTranslation()
  const history = useNavigate()

  const generateTitle = () => {
    return (
      <>
        <div className={classes.row}>
          <div
            className={classes.expand}
            data-test="recently-viewed-matter-title"
            onClick={props.onExpand}
          >
            <MattersIcon className={classes.matterIcon} />
            <Typography
              className={classes.linkText}
              data-test="recently-viewed-matter-title-text"
              variant="subtitle1"
            >
              {props.matters.find(matter => matter.id === props.matterId)?.name}
            </Typography>
            {
              <KeyboardArrowRight
                className={
                  props.expanded ? classes.expandedIcon : classes.collapsedIcon
                }
              />
            }
          </div>
          <Button
            className={classes.goToMatterButton}
            disableElevation
            endIcon={<ArrowForward className={classes.buttonIcon} />}
            size="small"
            onClick={() => history(getMatterOverviewUrl(props.matterId))}
            data-test="go-to-matter-overview"
          >
            <Typography variant="caption">
              {t('projectOverview.goToMatterOverview')}
            </Typography>
          </Button>
        </div>
      </>
    )
  }
  const generateMobileTitle = () => {
    return (
      <div className={classes.row} data-test="recently-viewed-matter-title">
        <MattersIcon className={classes.matterIcon} />

        <Typography
          className={classes.linkText}
          data-test="recently-viewed-matter-title-text"
          onClick={props.onExpand}
          variant="subtitle1"
        >
          {props.matters.find(matter => matter.id === props.matterId)?.name}
        </Typography>
        <KeyboardArrowRight
          className={
            props.expanded ? classes.expandedIcon : classes.collapsedIcon
          }
          onClick={props.onExpand}
        />
      </div>
    )
  }
  const expandedRow = task => {
    return (
      <div className={classes.taskChipRow} key={task.id}>
        <TaskChip
          context="recentlyViewed"
          isLink={true}
          task={task}
          projectId={task.projectId}
          matterId={props.matterId}
          showOptions={false}
          showInteractions={false}
          showDates={true}
          closeHandler={props.handleOptionsUpdate}
        ></TaskChip>
      </div>
    )
  }
  const generateExpandedTasks = () => {
    return (
      <div
        className={classes.hidden}
        style={{
          height:
            props.expanded &&
            `${
              props.tasks.filter(t => t.matterId === props.matterId).length * 45
            }px`,
        }}
      >
        {props.tasks
          .filter(t => t.matterId === props.matterId)
          .map(task => expandedRow(task))}
      </div>
    )
  }

  return (
    <>
      {!props.isMobile && generateTitle()}
      {props.isMobile && generateMobileTitle()}
      {generateExpandedTasks()}
    </>
  )
}

export default RecentlyViewedMatter
