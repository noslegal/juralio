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

import cloneDeep from 'lodash/cloneDeep'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useResizeDetector } from 'react-resize-detector'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import BigDataSpinner from '../../../components/feedback/big-data-spinner/BigDataSpinner'
import WithLoader from '../../../components/feedback/with-loader/WithLoader'
import { getPartitionData } from '../../../components/icicle/common/data/data-provider'
import DesktopIcicle from '../../../components/icicle/desktop/DesktopIcicle'
import {
  getProjectIdFromLocation,
  getTaskMapUrl,
  getTemplateIdFromLocation,
  getTemplateTaskMapUrl,
} from '../../../components/navigation/common/location-context-helper'
import { filterOutNotRequiredTasks } from '../../../services/helpers/task/task-util-helper'
import { CONFIG } from '../../constants'
import ProjectOverviewNoTasksPlaceholder from './ProjectOverviewNoTasksPlaceholder'
import ProjectOverviewTaskCell from './ProjectOverviewTaskCell'

const MINIMUM_HEIGHT_FOR_CONSTANT_LABEL = 34

const useStyles = makeStyles()(theme => ({
  taskMapContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',

    overflow: 'visible',
    cursor: 'pointer',
  },
}))

const countLeaves = t =>
  t?.tasks?.length ? t.tasks.reduce((a, b) => a + countLeaves(b), 0) : 1

const ProjectOverviewTaskMap = props => {
  const { classes } = useStyles()
  const { width, height } = useResizeDetector()

  const [partitionData, setPartitionData] = useState()
  const [forceRenderCount, setForceRenderCount] = useState(0)
  const history = useNavigate()
  useEffect(() => {
    setPartitionData(
      getPartitionData(
        filterOutNotRequiredTasks(cloneDeep(props.project)),
        'tasks'
      )
    )
  }, [props.project])
  const isTemplate = window.location.pathname.includes('/template')
  const matterId =
    useSelector(state => state.matterDetails.matter?.id) || undefined
  const projectId =
    getProjectIdFromLocation(window.location) || props.project.id

  const templateHasLoaded = useSelector(
    state => state.template.overview.isLoaded && state.template.areTasksLoaded
  )

  const navigateToTaskMap = () => {
    if (matterId !== undefined && projectId !== undefined) {
      history(getTaskMapUrl(undefined, matterId, projectId))
    } else {
      const templateId = getTemplateIdFromLocation(window.location)
      if (templateId) {
        history(getTemplateTaskMapUrl(templateId))
      }
    }
  }

  useEffect(() => {
    setForceRenderCount(forceRenderCount + 1)
  }, [width, height]) //eslint-disable-line

  const leafCount = countLeaves(props?.project)
  const cappedLeafCount = Math.min(leafCount, CONFIG.LEVEL_A_TASK_LIMIT)
  const heightInterp = cappedLeafCount / CONFIG.LEVEL_A_TASK_LIMIT
  const heightMultiplier = leafCount > 50 ? 300 : 250

  if ((isTemplate && !templateHasLoaded) || !partitionData) {
    return <BigDataSpinner size={80} />
  }
  if (!partitionData || partitionData.data.tasks?.length === 0) {
    return (
      <ProjectOverviewNoTasksPlaceholder
        isTemplate={true}
        project={props.project}
      />
    )
  }

  return partitionData ? (
    <div
      className={classes.taskMapContainer}
      onClick={navigateToTaskMap}
      data-test="project-overview-task-map"
      style={{
        width: '100%',
        position: 'relative',
      }}
    >
      <DesktopIcicle
        edgePadding={0}
        getIcicleRef={() => {}}
        separatorPadding={35}
        partitionData={partitionData}
        childrenPropertyName={'tasks'}
        parentPropertyName={'parent'}
        Template={ProjectOverviewTaskCell}
        interactive={false}
        overviewHeightThreshold={MINIMUM_HEIGHT_FOR_CONSTANT_LABEL}
        cellClickHandler={navigateToTaskMap}
        forceRenderCount={forceRenderCount}
        showPhaseLabels
        isForbidden={props.isForbidden}
        isReadOnly={props.isReadOnly}
        showDone={true}
        isViewOnly={props.isViewOnly}
      />
    </div>
  ) : null
}

export default WithLoader(200)(ProjectOverviewTaskMap)

ProjectOverviewTaskMap.propTypes = {
  project: PropTypes.object.isRequired,
  zeroStateText: PropTypes.string.isRequired,
}
