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

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import { Typography, useMediaQuery, useTheme } from '@mui/material'
import Button from '@mui/material/Button'
import DialogContent from '@mui/material/DialogContent'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import JuralioDialog from '../../../components/dialog/juralio-dialog/JuralioDialog'
import {
  getMatterIdFromLocation,
  getSingleWorkstreamTaskMapUrl,
  getTemplateIdFromLocation,
  getTemplateTaskMapUrl,
} from '../../../components/navigation/common/location-context-helper'
import juralioColours from '../../../theme/juralio-colours'
import { CONFIG } from '../../constants'
import { resetMatterState } from '../../matter-create/matter-create-actions'
import { exitSelectionMode } from '../../template/template-actions'
import { enableImmediateAdd } from '../project-actions'
import image1 from './img/MatterCreatedImg1.svg'
import image2 from './img/MatterCreatedImg2.svg'

const useStyles = makeStyles()(theme => ({
  root: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    height: theme.spacing(37.5),
  },
  buttonRow: {
    alignItems: 'center',
    display: 'flex',
    textAlign: 'center',
    paddingTop: theme.spacing(8),
    width: '98%',
    justifyContent: 'space-around',
  },
  buttonColumn: {
    display: 'flex',
    flexDirection: 'column',
    height: theme.spacing(18),
    width: theme.spacing(28),
    alignItems: 'inherit',
  },
  buttonImageAddPeople: {
    display: 'flex',
    minHeight: theme.spacing(13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonImageAddTask: {
    display: 'flex',
    minHeight: theme.spacing(13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: juralioColours.theme.primary.main,
    paddingBottom: theme.spacing(),
  },
  titleIcon: {
    color: juralioColours.theme.primary.main,
    height: theme.spacing(6),
    width: theme.spacing(6),
    marginTop: theme.spacing(0.6),
    marginRight: theme.spacing(),
  },
  heading: {
    display: 'flex',
  },
  nextStepButton: {
    width: theme.spacing(26),
    textTransform: 'none',
    color: juralioColours.darkText.primary,
  },
}))

const MatterCreatedDialog = props => {
  const theme = useTheme()
  const { classes } = useStyles()
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'))
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const history = useNavigate()
  const location = useLocation()
  useEffect(() => {
    dispatch(exitSelectionMode())
  }, []) //eslint-disable-line

  const navigateToTaskMap = () => {
    if (props.isTemplate) {
      history(getTemplateTaskMapUrl(getTemplateIdFromLocation(location)))
      return
    }

    history(getSingleWorkstreamTaskMapUrl(getMatterIdFromLocation(location)))
  }

  return (
    <JuralioDialog
      open={true}
      hideAction={true}
      hideCancel={true}
      fullScreen={isMobileView}
      handleCancel={() => dispatch(resetMatterState())}
    >
      <DialogContent data-test="dialog-content" className={classes.root}>
        <div className={classes.heading}>
          <CheckCircleOutlineIcon className={classes.titleIcon} />
          <Typography variant="h3" className={classes.title}>
            {t('matterCreatedDialog.title')}
          </Typography>
        </div>
        <Typography variant="h6" className={classes.breadcrumbSeparator}>
          {t('matterCreatedDialog.explanatoryText')}
        </Typography>
        <div className={classes.buttonRow}>
          <div className={classes.buttonColumn}>
            <div className={classes.buttonImageAddPeople}>
              <img src={image1} alt="start-adding-people" />
            </div>
            <Button
              component="span"
              className={classes.nextStepButton}
              variant="outlined"
              color="primary"
              disableElevation
              data-test="invite-people-button"
              onClick={() => {
                dispatch(resetMatterState())
                history(`/matteradmin/${getMatterIdFromLocation(location)}`, {
                  state: { tabItem: 1, immediateAddTeamMembers: true },
                })
              }}
            >
              {t('matterCreatedDialog.inviteButtonText')}
            </Button>
          </div>
          <div className={classes.buttonColumn}>
            <div className={classes.buttonImageAddTask}>
              <img src={image2} alt="start-adding-tasks" />
            </div>
            <Button
              component="span"
              className={classes.nextStepButton}
              variant="outlined"
              color="primary"
              disableElevation
              data-test="add-task-button"
              onClick={() => {
                dispatch(resetMatterState())
                if (props.taskCount < CONFIG.LEVEL_A_TASK_LIMIT) {
                  dispatch(enableImmediateAdd())
                }
                navigateToTaskMap()
              }}
            >
              {t('matterCreatedDialog.addTaskButtonText')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </JuralioDialog>
  )
}

export default MatterCreatedDialog
