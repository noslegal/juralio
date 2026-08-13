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
import React from 'react'
import { useTranslation } from 'react-i18next'
import StatusSelect from '../../../../inputs/status-select/StatusSelect'
import { useSelector } from 'react-redux'

const UserStatusToggle = props => {
  const instanceSettings = useSelector(state => state.instanceSettings.settings)

  const { t } = useTranslation()

  const USER_STATUS_OPTIONS = {
    optionOnName: t('common.active'),
    optionOffName: t('common.inactive'),
    optionOnValue: 'true',
    optionOffValue: 'false',
  }

  return (
    <div data-test="user-status-toggle-wrapper">
      <StatusSelect
        tooltipText={
          props.tooltipText
            ? props.tooltipText
            : props.isExternal &&
                instanceSettings.limitedSeats === 0 &&
                props.currentValue === 'false'
              ? t(
                  'userList.confirmationDialog.seatCounts.fullLimited.cantEnableLimited'
                )
              : !props.isExternal &&
                  instanceSettings.fullSeats === 0 &&
                  props.currentValue === 'false'
                ? t(
                    'userList.confirmationDialog.seatCounts.fullLimited.cantEnableFull'
                  )
                : ''
        }
        options={USER_STATUS_OPTIONS}
        currentValue={props.currentValue}
        updateStatus={props.updateStatus}
        readOnly={
          props.readOnly ||
          (props.isExternal &&
            instanceSettings.limitedSeats === 0 &&
            props.currentValue === 'false') ||
          (!props.isExternal &&
            instanceSettings.fullSeats === 0 &&
            props.currentValue === 'false')
        }
      />
    </div>
  )
}

UserStatusToggle.propTypes = {
  currentValue: PropTypes.string.isRequired,
  readOnly: PropTypes.bool.isRequired,
  updateStatus: PropTypes.func.isRequired,
}

export default UserStatusToggle
