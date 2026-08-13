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

import React from 'react'
import WorkstreamChip from './WorkstreamChip'
import { makeStyles } from 'tss-react/mui'
import { Typography } from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import rawColours from '../../../../theme/raw-colours'
import juralioColours from '../../../../theme/juralio-colours'
import {
  MultiplePostsIcon,
  MultipleTasksIcon,
  PeopleIcon,
} from '../../../../theme/navigation/CommonIcons'

const useStyles = makeStyles()(theme => ({
  masonryContainer: {
    /* Workstream card */

    boxSizing: 'border-box',

    /* Auto layout */
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '11.4775px 0px 0px',
    marginLeft: 'auto',
    marginRight: 'auto',

    width: '90%',
    height: '96px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: juralioColours.matterSwitcher.workstreamChip.hover,
    },

    background: '#FFFFFF',
    backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='25' ry='25' stroke='%233F799B80' strokeWidth='4' strokeDasharray='24' strokeDashoffset='28' strokeLinecap='square'/%3e%3c/svg%3e")`,
    borderRadius: '25px',
  },
  title: {
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
    color: rawColours.primary.blue.dark,
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
    color: rawColours.primary.blue.dark,
    marginTop: '0',
    marginBottom: 'auto',
  },
  workstreamChipContainer: {
    borderRadius: theme.spacing(0.5),
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(0.75),
    minWidth: theme.spacing(3),
    height: theme.spacing(2),
    display: 'flex',
  },
  overviewWrapper: {
    display: 'grid',
    gridTemplateColumns: '33% 33% 33%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginLeft: '34px',
    marginRight: 'auto',
  },
  overviewItemWrapper: {
    display: 'flex',
    marginTop: theme.spacing(),
  },
  overviewIcon: {
    height: theme.spacing(2),
    marginRight: theme.spacing(0.5),
    fill: rawColours.primary.blue.dark,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  overviewText: {
    fontSize: theme.spacing(1.5),
    color: rawColours.primary.blue.dark,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
}))

const WorkstreamList = props => {
  const { matter, projects, selectedProject } = props
  const { classes } = useStyles()
  return (
    <>
      <div>
        {matter.numProjects < 16 && (
          <div
            data-test="new-stream"
            className={classes.masonryContainer}
            style={
              selectedProject === 'new'
                ? {
                    backgroundColor:
                      juralioColours.matterSwitcher.workstreamChip.hover,
                  }
                : {}
            }
            onClick={() => props.selectProject('new')}
          >
            <div className={classes.topBar}>
              <div className={classes.workstreamChipContainer}>
                <AddIcon className={classes.upwardIcon} />
              </div>
              <Typography
                variant={props.isDefaultWorkstream ? 'overline' : 'body1'}
                className={classes.title}
                data-test="workstream-chip-title"
              >
                {'New Workstream'}
              </Typography>
            </div>
            <div className={classes.overviewWrapper}>
              <div className={classes.overviewItemWrapper}>
                <MultipleTasksIcon className={classes.overviewIcon} />
                <Typography
                  className={classes.overviewText}
                  data-test="workstream-chip-tasks"
                ></Typography>
              </div>
              <div className={classes.overviewItemWrapper}>
                <PeopleIcon className={classes.overviewIcon} />
                <Typography
                  className={classes.overviewText}
                  data-test="workstream-chip-tasks"
                ></Typography>
              </div>
              <div className={classes.overviewItemWrapper}>
                <MultiplePostsIcon className={classes.overviewIcon} />
                <Typography
                  className={classes.overviewText}
                  data-test="workstream-chip-tasks"
                ></Typography>
              </div>
            </div>
          </div>
        )}
        {projects.map(project => (
          <WorkstreamChip
            workstream={project}
            matter={matter}
            isDefaultWorkstream={false}
            handleRedirect={() => {}}
            isExpanded={false}
            handleMouseOver={() => {}}
            handleMouseLeave={() => {}}
            showGoToText={false}
            alternateOnClick={props.selectProject}
            isSelected={selectedProject === project.id ? true : false}
          />
        ))}
      </div>
    </>
  )
}
export default WorkstreamList
