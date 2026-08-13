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

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  addMember,
  removeMember,
} from '../../../../redux/ducks/private-workstream-team'
import { fetchProjectWithTaskTeams } from '../../../project/project-actions'
import { fetchMatterDetails } from '../../matter-details-actions'
import {
  clearErrorMessage,
  fetchWorkstreamAdminList,
  updatePrivateWorkstreamTeam,
  updateProject,
} from '../projects-actions'
import WorkstreamDetail from './WorkstreamDetail'

const WorkstreamDetailContainer = props => {
  const dispatch = useDispatch()

  const [startingTab, setStartingTab] = useState(0)
  const mode = useSelector(state => state.matterDetails.mode)
  const matterId = useSelector(state => state.matterDetails.matter.id)
  const matterTeam = useSelector(state => state.matterTeam.mainPage.team)
  const workstreams = useSelector(state => state.projects.items)
  const privateWorkstreamTeam = useSelector(
    state => state.privateWorkstreamTeam
  )
  useEffect(() => {
    if (typeof props.workstreamIndex !== 'string' || workstreams?.length === 0)
      return
    const workstreamIndexInt = parseInt(props.workstreamIndex)
    const index = workstreams.findIndex(w => w.id === workstreamIndexInt)
    props.setSelectedWorkstreamIndex(index)
    setStartingTab(1)
  }, [props.workstreamIndex, workstreams]) //eslint-disable-line
  const workstream = workstreams[props.workstreamIndex]

  const _updateProject = (matterId, workstreamId, properties) =>
    dispatch(updateProject(matterId, workstreamId, properties))

  const _clearErrorMessage = projectId => dispatch(clearErrorMessage(projectId))

  useEffect(() => {
    dispatch(fetchWorkstreamAdminList(matterId))
  }, [privateWorkstreamTeam]) //eslint-disable-line

  const _removeMember = (privateWorkstreamMemberId, userId) => {
    dispatch(
      updatePrivateWorkstreamTeam(
        workstream,
        workstream.privateWorkstreamTeam.filter(m => m.user.id !== userId)
      )
    )
    dispatch(
      removeMember(matterId, workstream.id, privateWorkstreamMemberId)
    ).then(() =>
      dispatch(fetchProjectWithTaskTeams(workstream.matter.id, workstream.id))
    )
  }

  const _addMember = user => {
    dispatch(
      updatePrivateWorkstreamTeam(workstream, [
        ...workstream.privateWorkstreamTeam,
        user,
      ])
    )
    dispatch(addMember(matterId, workstream.id, [user.user.id])).then(() =>
      dispatch(fetchProjectWithTaskTeams(workstream.matter.id, workstream.id))
    )
  }

  const _fetchMatterDetails = (id, bool) =>
    dispatch(fetchMatterDetails(id, bool))

  if (!workstream) return null

  return (
    <WorkstreamDetail
      startingTab={startingTab}
      setSelectedWorkstreamIndex={props.setSelectedWorkstreamIndex}
      workstream={workstream}
      isLoaded={!!workstream}
      updateProject={_updateProject}
      clearErrorMessage={_clearErrorMessage}
      mode={mode}
      matterId={matterId}
      matterTeam={matterTeam}
      addMember={_addMember}
      removeMember={_removeMember}
      fetchMatterDetails={_fetchMatterDetails}
    />
  )
}
export default WorkstreamDetailContainer
