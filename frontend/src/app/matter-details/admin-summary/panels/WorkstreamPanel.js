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

import { Button, Link, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { makeStyles } from 'tss-react/mui'
import ProjectCreateContainer from '../../../../app/matter-details/projects/ProjectCreateContainer'
import PanelWithIcon from '../../../../components/data-display/panel-with-icon/PanelWithIcon'
import { getMatterIdFromLocation } from '../../../../components/navigation/common/location-context-helper'
import { useIsViewOnly } from '../../../../hooks/matter/viewer/matter-viewer-hooks'
import { WorkstreamIcon } from '../../../../theme/navigation/CommonIcons'
import { ACTIVITIES } from '../../../constants'

const useStyles = makeStyles()(theme => ({
  root: {
    padding: theme.spacing(),
    textAlign: 'left',
  },
  workstreamIcon: {
    height: theme.spacing(5),
    marginLeft: theme.spacing(0.5),
    width: theme.spacing(5),
  },
  textRow: {
    display: 'flex',
    flexFlow: 'row wrap',
    paddingBottom: theme.spacing(2),
  },
  helpLink: { paddingRight: theme.spacing(0.5) },
  title: {
    marginBottom: theme.spacing(),
  },
  workstreamNumber: {
    marginTop: '-4px',
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing(),
  },
  workstreamDetail: { display: 'flex' },
  workstreamClosed: {
    display: 'flex',
    marginLeft: theme.spacing(),
  },
}))

const WorkstreamPanel = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const [showWorkstreamCreateDialog, setShowWorkstreamCreateDialog] =
    useState(false)
  const { matter } = props
  const isViewOnly = useIsViewOnly(matter)
  const history = useNavigate()
  const location = useLocation()

  if (!matter) return null

  const isMatterActive = matter.matterStatus === 'active'
  const isUserMatterAdmin = matter.activities?.includes(ACTIVITIES.MATTER_ADMIN)
  const showCreate =
    isMatterActive &&
    isUserMatterAdmin &&
    matter.numProjects === 1 &&
    !isViewOnly

  const workstreamCount = matter.numProjects == null ? 0 : matter.numProjects
  const activeWorkstreamCount =
    matter.activeWorkstreams == null ? 0 : matter.activeWorkstreams
  const closedWorkstreamCount = workstreamCount - activeWorkstreamCount

  const goToWorkstream = () => {
    history(`/matteradmin/${getMatterIdFromLocation(location)}`, {
      replace: true,
      state: { tabItem: 2 },
    })
  }

  return (
    <div className={classes.root}>
      <PanelWithIcon>
        <WorkstreamIcon className={classes.workstreamIcon} />
        {workstreamCount < 2 &&
          renderSingleOrZeroWorkstreams(
            t,
            classes,
            workstreamCount,
            showCreate,
            setShowWorkstreamCreateDialog
          )}

        {workstreamCount > 1 &&
          renderMultipleWorkstreams(
            t,
            classes,
            matter,
            isMatterActive,
            activeWorkstreamCount,
            closedWorkstreamCount,
            goToWorkstream
          )}

        {showWorkstreamCreateDialog && (
          <ProjectCreateContainer
            firstCreation={true}
            closeHandler={() => setShowWorkstreamCreateDialog(false)}
          />
        )}
      </PanelWithIcon>
    </div>
  )
}

const renderSingleOrZeroWorkstreams = (
  t,
  classes,
  workstreamCount,
  showCreate,
  setShowWorkstreamCreateDialog
) => {
  return (
    <div data-test="single-workstreams">
      {workstreamCount === 1 && (
        <Typography variant="body2" className={classes.title}>
          {t('matterAdmin.workstreams.singleWorkstream')}
        </Typography>
      )}
      <Typography variant="body1">
        {t('matterAdmin.workstreams.singleWorkstreamExplanatory1')}
      </Typography>
      {showCreate && (
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            setShowWorkstreamCreateDialog(true)
          }}
          data-test="create-new-workstream"
        >
          {t('matterAdmin.workstreams.createNewWorkstream')}
        </Button>
      )}
    </div>
  )
}

const renderMultipleWorkstreams = (
  t,
  classes,
  matter,
  isMatterActive,
  activeWorkstreamCount,
  closedWorkstreamCount,
  goToWorkstream
) => {
  return (
    <div>
      <div
        className={classes.workstreamDetail}
        data-test="multiple-workstreams"
      >
        <Typography variant="body1" className={classes.title}>
          {t('matterAdmin.workstreams.multipleWorkstreams1')}
        </Typography>
        {!isMatterActive ? (
          <React.Fragment>
            <Typography
              variant="h6"
              className={classes.workstreamNumber}
              data-test="matter-project-count"
            >
              {matter.numProjects}
            </Typography>
            <Typography variant="body1" className={classes.title}>
              {t('matterAdmin.workstreams.multipleWorkstreamsClosed', {
                count: matter.numProjects,
              })}
            </Typography>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Typography
              variant="h6"
              className={classes.workstreamNumber}
              data-test="matter-project-count"
            >
              {activeWorkstreamCount}
            </Typography>
            <Typography variant="body1" className={classes.title}>
              {t(
                `matterAdmin.workstreams.${
                  activeWorkstreamCount === 1
                    ? 'multipleWorkstreams2'
                    : 'multipleWorkstreams2_other'
                }`,
                {
                  count: activeWorkstreamCount,
                }
              )}
              {closedWorkstreamCount > 0 ? ',' : '.'}
            </Typography>
          </React.Fragment>
        )}

        {closedWorkstreamCount > 0 && isMatterActive && (
          <div className={classes.workstreamClosed}>
            <Typography variant="body1" className={classes.title}>
              {t('matterAdmin.workstreams.multipleWorkstreams3')}
            </Typography>
            <Typography
              variant="h6"
              className={classes.workstreamNumber}
              data-test="matter-project-count"
            >
              {closedWorkstreamCount}
            </Typography>
            <Typography variant="body1" className={classes.title}>
              {t('matterAdmin.workstreams.multipleWorkstreams4', {
                count: closedWorkstreamCount,
              })}
            </Typography>
          </div>
        )}
      </div>
      <Link
        style={{ cursor: 'pointer' }}
        onClick={() => goToWorkstream()}
        variant="caption"
        className={classes.title}
      >
        {t('matterAdmin.workstreams.multipleWorkstreams5')}
      </Link>
    </div>
  )
}

export default WorkstreamPanel
