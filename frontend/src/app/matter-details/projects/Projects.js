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

import { mdiArrowLeftCircle } from '@mdi/js'
import Icon from '@mdi/react'
import { Button, Paper, Tooltip, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import ClosedInfoBox from '../../../components/data-display/closed-info-box/ClosedInfoBox'
import NoContent from '../../../components/data-display/no-content/NoContent'
import withLoader from '../../../components/feedback/with-loader/WithLoader'
import juralioColours from '../../../theme/juralio-colours'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'
import { MultipleWorkstreamsIcon } from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'
import { STATUS_TYPE } from '../../constants'
import PanelTitle from '../../organisation/users/panels/PanelTitle'
import WorkstreamPanel from '../admin-summary/panels/WorkstreamPanel'
import ProjectCreateContainer from './ProjectCreateContainer'
import ProjectsTableContainer from './projects-table/ProjectsTableContainer'

const useStyles = makeStyles()(theme => ({
  noPermText: {
    color: juralioColours.error,
  },
  createWorkstreamButton: {
    height: theme.spacing(5),
    alignSelf: 'center',
  },
  textHelper: {
    display: 'flex',
    paddingLeft: theme.spacing(1.5),
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    marginLeft: theme.spacing(2),
    width: '30%',
    alignItems: 'center',
    backgroundColor: JuralioNamedColours.beige[100],
  },
  arrowIcon: {
    paddingRight: theme.spacing(1.5),
  },
}))

const displayNoContent = message => (
  <NoContent variant="subtitle1" data-test="no-content">
    {message}
  </NoContent>
)

const Projects = props => {
  const { classes } = useStyles()
  const { matter } = props
  const { t } = useTranslation()

  const [showWorkstreamCreateDialog, setShowWorkstreamCreateDialog] =
    useState(false)

  const renderProjectsTable = () =>
    matter && props.projects && props.projects.length > 0 ? (
      <ProjectsTableContainer
        actions={{ ...props.actions }}
        data={props.projects}
        matterId={matter.id.toString()}
        mode={props.mode}
        readOnly={matter.matterStatus === STATUS_TYPE.CLOSED}
        setSelectedWorkstreamIndex={props.setSelectedWorkstreamIndex}
      />
    ) : (
      displayNoContent(t('projectsList.noDisplay'))
    )
  return (
    <Paper
      data-test="projects"
      style={{ padding: '24px', overflowY: 'auto', overflowX: 'auto' }}
    >
      <PanelTitle
        icon={<MultipleWorkstreamsIcon />}
        header={t('entity.workstreams')}
        caption={''}
      />
      {matter.matterStatus === 'closed' && (
        <ClosedInfoBox text={t('matterAdmin.workstreams.closedHelper')} />
      )}
      {matter.activities && matter.activities.length < 2 ? (
        <Typography data-test="no-permissions" className={classes.noPermText}>
          {t('matterAdmin.workstreams.noPermission')}
        </Typography>
      ) : props.projects.length > 1 &&
        matter.matterStatus === STATUS_TYPE.ACTIVE ? (
        <div style={{ display: 'flex' }}>
          <Tooltip
            title={
              props.projects.length > 15
                ? 'Reached maximum number of workstreams'
                : ''
            }
          >
            <span>
              <Button
                disabled={props.projects.length > 15}
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setShowWorkstreamCreateDialog(true)}
                data-test="create-new-workstream"
                className={classes.createWorkstreamButton}
              >
                {t('matterAdmin.workstreams.createNewWorkstream')}
              </Button>
            </span>
          </Tooltip>
          <div className={classes.textHelper} data-test="team-helper">
            <Icon
              path={mdiArrowLeftCircle}
              size={1.5}
              color={rawColours.primary.primary.main}
              className={classes.arrowIcon}
            />
            <Typography>
              {t('projectCreation.createWorkstreamHelper')}
            </Typography>
          </div>
        </div>
      ) : (
        props.projects.length === 1 && <WorkstreamPanel matter={matter} />
      )}
      {showWorkstreamCreateDialog && (
        <ProjectCreateContainer
          firstCreation={false}
          closeHandler={() => setShowWorkstreamCreateDialog(false)}
        />
      )}

      {props.canViewProjects &&
        props.projects.length > 1 &&
        renderProjectsTable()}
    </Paper>
  )
}
export default withLoader(200)(Projects)
