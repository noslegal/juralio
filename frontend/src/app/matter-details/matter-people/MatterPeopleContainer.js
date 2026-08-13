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
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  addAdmin,
  addCosts,
  addEditor,
  addViewOnly,
  fetchTeam,
  removeAdmin,
  removeCosts,
  removeEditor,
  removeUser,
  removeViewOnly,
} from '../../../redux/ducks/matter-team'
import withRouter from '../../../services/navigation/WithRouter'
import { OPERATION_MODE } from '../../constants'
import MatterPeople from './MatterPeople'

const MatterPeopleContainer = props => {
  useEffect(() => {
    props.teamActions.fetchTeam(props.matterId, false, true)
    //eslint-disable-next-line
  }, [props.matterId])

  const isClosed = props.matter && props.matter.matterStatus === 'closed'

  return (
    <MatterPeople
      teamActions={props.teamActions}
      isLoaded={props.team.isLoaded}
      isClosed={isClosed}
      team={props.team}
      teamIsLoaded={props.teamIsLoaded}
      mode={isClosed ? OPERATION_MODE.VIEW : props.mode}
      currentUser={props.currentUser}
      matter={props.matter}
    />
  )
}

function mapStateToProps(state) {
  return {
    mode: state.matterDetails.mode,
    matter: state.matterDetails.matter,
    team: state.matterTeam.mainPage.team,
    teamIsLoaded: state.matterTeam.mainPage.isLoaded, // Makes React rerender when it gets the team
    currentUser: state.auth.data.auth,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    teamActions: {
      fetchTeam: bindActionCreators(fetchTeam, dispatch),
      addViewer: bindActionCreators(addViewOnly, dispatch),
      addEditor: bindActionCreators(addEditor, dispatch),
      addAdmin: bindActionCreators(addAdmin, dispatch),
      removeViewOnly: bindActionCreators(removeViewOnly, dispatch),
      removeEditor: bindActionCreators(removeEditor, dispatch),
      removeAdmin: bindActionCreators(removeAdmin, dispatch),
      removeUser: bindActionCreators(removeUser, dispatch),
      removeCosts: bindActionCreators(removeCosts, dispatch),
      addCosts: bindActionCreators(addCosts, dispatch),
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(MatterPeopleContainer))
