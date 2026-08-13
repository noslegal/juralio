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

import AddIcon from '@mui/icons-material/Add'
import { Button, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import zeroStateImage2 from '../../../assets/images/Curvetree.png'
import zeroStateImage1 from '../../../assets/images/PineTree.png'
import NoContent from '../../../components/data-display/no-content/NoContent'
import {
  getMatterIdFromLocation,
  getProjectIdFromLocation,
  getTaskMapUrl,
  getTemplateIdFromLocation,
  getTemplateTaskMapUrl,
} from '../../../components/navigation/common/location-context-helper'
import juralioColours from '../../../theme/juralio-colours'
import { enableImmediateAdd as enableImmediateAddProjectTask } from '../project-actions'
import WorkstreamExportDialog from '../../../components/dialog/workstream-export-dialog/WorkstreamExportDialog'
import { enableImmediateAdd } from '../../template/template-actions'
import CreateTaskFromTemplateFlowContainer from '../../../components/flows/create-task-flow/CreateTaskFromTemplateFlowContainer'

const style = makeStyles()(theme => ({
  addButton: {
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(4),
    width: 372,
    height: 64,
    borderStyle: 'dashed',
    borderWidth: 2,
    color: juralioColours.darkText.secondary,
    borderColor: juralioColours.darkText.disabled,
    backgroundColor: 'white',
    textTransform: 'none',
  },
  addIcon: {
    border: `2px solid ${juralioColours.control.borderLight}`,
    borderRadius: 5,
    color: juralioColours.darkText.secondary,
    fontSize: 'large',
  },
  mapImage: {
    marginBottom: theme.spacing(2),
    position: 'relative',
  },
  image: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  pineTreImage: {
    top: '-170px',
    left: '-305px',
  },
  curveTreeImage: {
    top: '-180px',
    left: '115px',
  },
  taskMapContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',

    overflow: 'visible',
    cursor: 'pointer',
  },
  zeroStateContainer: {
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  zeroState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    width: theme.spacing(40),
  },
}))

const ProjectOverviewNoTasksPlaceholder = props => {
  const { classes } = style()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const history = useNavigate()
  const location = useLocation()
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [showAddFromTempFlow, setShowAddFromTempFlow] = useState(false)
  const navigateToTaskMap = () => {
    if (props.isTemplate) {
      history(getTemplateTaskMapUrl(getTemplateIdFromLocation(location)))
    } else {
      history(
        getTaskMapUrl(
          undefined,
          getMatterIdFromLocation(location),
          props.isMatterOverview
            ? props.projectId
            : getProjectIdFromLocation(location)
        )
      )
    }
  }
  const addTaskHandler = () => {
    if (props.isTemplate) {
      dispatch(enableImmediateAdd())
    } else {
      dispatch(enableImmediateAddProjectTask())
    }
    navigateToTaskMap()
  }
  const zeroStateText = props.isMatterOverview
    ? t('matter.overview.roadmap.noTasks')
    : props.isTemplate
      ? t('templateOverview.templateZeroStateText')
      : t('project.overview.roadmap.noTasks')
  return (
    <>
      <div className={classes.zeroStateContainer}>
        {showDownloadDialog && (
          <WorkstreamExportDialog
            onClose={() => setShowDownloadDialog(false)}
            isTemplate={props.isTemplate}
          />
        )}

        <div className={classes.zeroState}>
          <div className={classes.mapImage}>
            <img
              width={200}
              height={400}
              src={zeroStateImage1}
              alt={zeroStateText}
              data-test="zero-state-image"
              className={`${classes.image} ${classes.pineTreImage}`}
            />
            <img
              width={200}
              height={400}
              src={zeroStateImage2}
              alt={zeroStateText}
              data-test="zero-state-image"
              className={`${classes.image} ${classes.curveTreeImage}`}
            />
          </div>
          {!props.isReadOnly && (
            <>
              <NoContent
                variant="subtitle1"
                data-test="project-overview-taskmap-no-content"
              >
                {zeroStateText}
                <Typography>
                  {t('matter.overview.getStartedFirstPhase')}
                </Typography>
              </NoContent>
              {!props.isMatterViewer && (
                <>
                  <Button
                    variant="contained"
                    className={classes.addButton}
                    disableElevation
                    startIcon={<AddIcon className={classes.addIcon} />}
                    onClick={() => {
                      addTaskHandler()
                    }}
                    data-test="add-task-button"
                  >
                    {t('matter.overview.projectOverviewZeroState')}
                  </Button>
                  <Button
                    variant="contained"
                    className={classes.addButton}
                    disableElevation
                    startIcon={<AddIcon className={classes.addIcon} />}
                    onClick={() => {
                      setShowAddFromTempFlow(true)
                      // addTaskHandler()
                    }}
                    data-test="add-from-template-flow"
                  >
                    {t('matter.overview.useATemplate')}
                  </Button>
                  {showAddFromTempFlow && (
                    <CreateTaskFromTemplateFlowContainer
                      cancelHandler={() => setShowAddFromTempFlow(false)}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default ProjectOverviewNoTasksPlaceholder
