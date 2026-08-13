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

import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import matterService from '../../../../../services/matter/matter-service'
import { ACTIVITIES } from '../../../../constants'
import ProjectPeople from './ProjectPeople'

const ProjectPeopleContainer = props => {
  const user = useSelector(state => state.auth.data.auth.username)
  const [matterTeam, setMatterTeam] = useState([])
  const matterDetails = useSelector(state => state.matterDetails)
  const reduxMatterTeam = useSelector(state => state.matterTeam)
  const [loadingMatterTeam, setLoadingMatterTeam] = useState(false)
  const { matterId, teamOnProject } = props
  const isUserMatterAdmin = () =>
    matterDetails &&
    matterDetails.matter &&
    matterDetails.matter.activities &&
    matterDetails.matter.activities[0] === ACTIVITIES.MATTER_ADMIN
  const isMatterAdmin = isUserMatterAdmin()

  useEffect(() => {
    if (!loadingMatterTeam && !matterTeam && matterId) {
      setLoadingMatterTeam(true)
      matterService.getMatterTeam(matterId, true, true).then(response => {
        setLoadingMatterTeam(false)
      })
    }
  }, [loadingMatterTeam, matterId, matterTeam])

  useEffect(() => {
    if (props.isMatterOverview) {
    } else {
    }
  }, []) //eslint-disable-line

  useEffect(() => {
    if (
      isMatterAdmin &&
      reduxMatterTeam.mainPage.isLoaded &&
      !loadingMatterTeam &&
      matterId
    ) {
      matterService.getMatterTeam(matterId, true, true).then(response => {
        setMatterTeam(response.body)
      })
    }
  }, [reduxMatterTeam.mainPage.isLoaded]) //eslint-disable-line

  if (!matterTeam || !teamOnProject) return null
  const matterAdmins = matterTeam.filter(user => user.matterAdminId > 0)
  return (
    <div style={{ margin: '8px' }}>
      <ProjectPeople
        matterAdmins={matterAdmins}
        teamOnProject={teamOnProject}
        privateTeamMembers={props.privateTeamMembers}
        currentUser={user}
        isMatterOverview={props.isMatterOverview}
        isPrivate={props.isPrivate}
        isMatterAdmin={isMatterAdmin}
        matterDetails={matterDetails}
        matterId={matterId.toString()}
        matterTeam={matterTeam}
      />
    </div>
  )
}

ProjectPeopleContainer.propTypes = {
  /** matterTeam */
  matterTeam: PropTypes.array.isRequired,
  /** teamOnProject */
  teamOnProject: PropTypes.array.isRequired,
}

export default ProjectPeopleContainer
