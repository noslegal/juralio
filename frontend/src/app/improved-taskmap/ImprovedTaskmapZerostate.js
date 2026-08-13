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

import { Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import { makeStyles } from 'tss-react/mui'
import zeroStateImage2 from '../../assets/images/Heather.png'
import zeroStateImage from '../../assets/images/taskmap-zerostate-arrow.svg'
import {
  getMatterIdFromLocation,
  getProjectIdFromLocation,
  isInTemplate,
} from '../../components/navigation/common/location-context-helper'
import { addPlaceholderTask } from '../../redux/ducks/improved-taskmap'
import { TASK_STATUS } from '../constants'
import { disableImmediateAdd } from '../project/project-actions'
import ZeroStateCreateButton from '../task-map/zero-state/ZeroStateCreateButton'
import { disableImmediateAdd as disableTemplateImmediateAdd } from '../template/template-actions'
const styles = makeStyles()(theme => ({
  content: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  arrow: {
    position: 'absolute',
    transform: 'translate(-200%,-50%)',
  },

  zeroStateRoot: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    position: 'relative',
  },
  zeroStateImage: {
    width: '60%',
    marginTop: 'auto',
    marginLeft: 'auto',
    pointerEvents: 'none',
  },
}))

const ImprovedTaskmapZeroState = props => {
  const { t } = useTranslation()
  const { classes } = styles()
  const isTemplate = isInTemplate(window.location.href)
  const structure = useSelector(state => state.improvedTaskmap.structure)
  const project = useSelector(state => state.project)
  const template = useSelector(state => state.template)
  const dispatch = useDispatch()
  const location = useLocation()

  const createPlaceholder = () => {
    const placeholderObject = {
      id: -1,
      project: { id: getProjectIdFromLocation(location) },
      matterId: getMatterIdFromLocation(location),
      level: -1,
      status: isTemplate ? undefined : TASK_STATUS.NOT_STARTED,
      parent: { id: -1 },
    }

    let fakeStructure = { tasks: [...structure, placeholderObject] }

    dispatch(addPlaceholderTask(fakeStructure, placeholderObject, true, true))
  }
  useEffect(() => {
    if (isTemplate) {
      if (template.immediateAddTask) {
        createPlaceholder()
        if (template.immediateAddTask) {
          dispatch(disableTemplateImmediateAdd())
        }
      }
    } else {
      if (props.hasLoadedOnce === 1 || project.immediateAddTask) {
        createPlaceholder()
        if (project.immediateAddTask) {
          dispatch(disableImmediateAdd())
        }
      }
    }
  }, []) //eslint-disable-line
  return (
    <div className={classes.zeroStateRoot}>
      <ZeroStateCreateButton createFirstTask={createPlaceholder} />
      <div className={classes.content}>
        <div style={{ marginTop: 'auto' }}>
          {!props.viewOnly && (
            <div className={classes.arrow}>
              <img
                style={{ pointerEvents: 'none' }}
                src={zeroStateImage}
                data-test="zero-state-image"
                alt={t('taskmapZeroState.arrowAlt')}
              />
            </div>
          )}
          <Typography
            color="textSecondary"
            variant="h5"
            data-test="zero-state-title"
          >
            {t(
              isTemplate
                ? 'taskmapZeroState.template.title'
                : 'taskmapZeroState.title'
            )}
          </Typography>
          <Typography
            color="textSecondary"
            variant="body1"
            data-test="zero-state-caption"
          >
            {t('taskmapZeroState.caption')}
          </Typography>
        </div>

        <img
          src={zeroStateImage2}
          data-test="zero-state-image"
          alt={'heather'}
          className={classes.zeroStateImage}
        />
      </div>
    </div>
  )
}
export default ImprovedTaskmapZeroState
