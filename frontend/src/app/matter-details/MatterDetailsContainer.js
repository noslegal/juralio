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

import React from 'react'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import experimentalServices from '../../services/experimental/experimental-services'
import withRouter from '../../services/navigation/WithRouter'
import { setupExperimentalSettings } from '../experimental/experimental-actions'
import {
  clearMatterDetails,
  fetchMatterDetails,
  updateMatterDetails,
} from './matter-details-actions'
import MatterDetails from './MatterDetails'
import { getMatterIdFromLocation } from '../../components/navigation/common/location-context-helper'

class MatterDetailsContainer extends React.Component {
  componentDidMount() {
    this.props.actions.fetchMatterDetails(
      getMatterIdFromLocation(this.props.router.location)
    )
    experimentalServices
      .getExperimentalConfig()
      .then(response => this.props.actions.setupExperimentalSettings(response))
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.router.params.matterId !==
      getMatterIdFromLocation(this.props.router.location)
    ) {
      this.props.actions.fetchMatterDetails(
        getMatterIdFromLocation(this.props.router.location)
      )
    }
  }

  componentWillUnmount() {
    this.props.actions.clearMatterDetails()
  }

  render() {
    return <MatterDetails {...this.props} />
  }
}

function mapStateToProps(state) {
  return { ...state.matterDetails }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      setupExperimentalSettings: bindActionCreators(
        setupExperimentalSettings,
        dispatch
      ),
      fetchMatterDetails: bindActionCreators(fetchMatterDetails, dispatch),
      updateMatterDetails: bindActionCreators(updateMatterDetails, dispatch),
      clearMatterDetails: bindActionCreators(clearMatterDetails, dispatch),
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(withRouter(MatterDetailsContainer)))
