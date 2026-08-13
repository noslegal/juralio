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

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchTaskmapContent,
  fetchTemplateTaskmapContent,
  visitWorkstream,
} from '../../../redux/ducks/improved-taskmap'
import { getLocationParams } from '../../../services/helpers/route/route-helper'
import ListTaskGroup from './ListTaskGroup'
import { fetchProjectWithPostsAndTaskTeam } from '../../../app/project/project-actions'
import ListViewZeroState from './ListViewZeroState'
import RoadmapConstants from '../../../app/roadmap/helpers/roadmap-constants'
import { makeStyles } from 'tss-react/mui'
import BigDataSpinner from '../../feedback/big-data-spinner/BigDataSpinner'
import {
  getTemplateIdFromLocation,
  isInTemplate,
} from '../../navigation/common/location-context-helper'
import ListTemplateTaskGroup from './ListTemplateTaskGroup'
import { useLocation } from 'react-router'
import { getDetailsAttribute } from '../../../services/user/user-data-service'
import TasklistFtue from '../../data-display/ftue/tasklist/TasklistFtue'
import { ACTIVITIES, MATTER_STATUS } from '../../../app/constants'
import MatterClosed from '../../data-display/matter-closed/MatterClosed'

const useStyles = makeStyles()(() => ({
  root: {
    width: 'calc(100%)',
    height: '100%',
    marginLeft: RoadmapConstants.ROADMAP_LHS_MARGIN,
    marginRight: RoadmapConstants.ROADMAP_RHS_MARGIN,
    overflowY: 'scroll',
  },
}))

const ListViewContainer = props => {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const matter = useSelector(state => state.matterDetails.matter)
  const matterId = props.identifiers?.matterId || getLocationParams('matter')
  const workstreamId =
    props.identifiers?.workstreamId ||
    getLocationParams('workstream') ||
    matter?.projects[0]?.id
  const project = useSelector(state => state.project)
  const improvedTaskmap = useSelector(state => state.improvedTaskmap)
  const isLoaded = useSelector(state => state.improvedTaskmap.isLoaded)
  const isTemplate = isInTemplate(window.location.href)
  const location = useLocation()
  const templateId = getTemplateIdFromLocation(location)
  const isMatterClosed = matter?.matterStatus === MATTER_STATUS.CLOSED

  useEffect(() => {
    if (isMatterClosed) {
      return
    }
    if (matterId && workstreamId) {
      dispatch(visitWorkstream())
      dispatch(fetchTaskmapContent(matterId, workstreamId))
      dispatch(fetchProjectWithPostsAndTaskTeam(matterId, workstreamId))
    } else if (templateId) {
      dispatch(fetchTemplateTaskmapContent(templateId))
    }
    //eslint-disable-next-line
  }, [workstreamId, matterId, templateId, isMatterClosed])

  if (isMatterClosed) {
    return (
      <MatterClosed
        isAdmin={matter.activities?.includes(ACTIVITIES.MATTER_ADMIN)}
        matterId={matterId}
      />
    )
  }

  if (!isLoaded) {
    return <BigDataSpinner size={80} />
  } else if (
    improvedTaskmap.tasks.length === 0 ||
    improvedTaskmap.tasks.filter(task => task.level > 1).length === 0
  ) {
    return (
      <div className={classes.root}>
        <ListViewZeroState />
      </div>
    )
  } else {
    return (
      <>
        {!getDetailsAttribute([
          'firstTimeUserExperience',
          'hasSeenTasklist',
        ]) && <TasklistFtue />}
        {isTemplate ? (
          <div>
            <ListTemplateTaskGroup
              droppableId={'global'}
              isReadOnly={false}
              templateId={templateId}
            />
          </div>
        ) : (
          project &&
          matter && (
            <div>
              <ListTaskGroup
                matterId={matterId}
                workstreamId={workstreamId}
                droppableId={'global'}
                isReadOnly={false}
              />
            </div>
          )
        )}
      </>
    )
  }
}
export default ListViewContainer
