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
import { connect } from 'react-redux'
import ChangePassword from './ChangePassword'
import { bindActionCreators } from 'redux'
import { changePasswordAndLogin } from '../../../../services/user/auth/auth-actions'
import { clearValidation } from '../../login-forms-actions'

class ChangePasswordContainer extends React.Component {
  render() {
    return <ChangePassword {...this.props} />
  }
}

function mapStateToProps(state) {
  return {
    ...state.login.loginForms,
    ...state.login.changePasswordForm,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      clearValidation: bindActionCreators(clearValidation, dispatch),
      changePasswordAndLogin: bindActionCreators(
        changePasswordAndLogin,
        dispatch
      ),
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangePasswordContainer)
