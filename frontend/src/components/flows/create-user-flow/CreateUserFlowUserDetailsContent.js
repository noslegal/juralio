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

import HelpIcon from '@mui/icons-material/Help'
import InfoIcon from '@mui/icons-material/Info'
import WarningIcon from '@mui/icons-material/Warning'
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { withTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { withStyles } from 'tss-react/mui'
import { sysadminUserCreationOrgSteps } from '../../../services/tour/steps/sysadmin-user-creation-org'
import {
  clearTour,
  setAvailableTours,
  setTour,
} from '../../../services/tour/tour-actions'
import tourService from '../../../services/tour/tour-service'
import rawColours from '../../../theme/raw-colours'
import BulkAddUserComponent from './BulkAddUserComponent'
import juralioColours from '../../../theme/juralio-colours'

const styles = theme => ({
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    paddingBottom: theme.spacing(1.5),
  },
  rowNoPadding: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  name: {
    paddingRight: theme.spacing(2),
    flex: '1 1 272px',
  },
  email: {
    flex: '1 1 653px',
  },
  organisation: {
    flex: '1 1 653px',
  },
  radioButton: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(4),
  },
  orgWarning: {
    display: 'flex',
  },
  warningIcon: {
    width: theme.spacing(2),
    marginTop: 'auto',
    marginBottom: 'auto',
    marginRight: theme.spacing(),
  },
  formControl: {
    width: '100%',
    height: theme.spacing(7),
    marginBottom: theme.spacing(),
  },
  internalUserDropdown: {
    width: '95%',
    marginLeft: '8px',
    marginTop: theme.spacing(2),
  },
  emailHelperText: {
    marginTop: theme.spacing(2),
    color: rawColours.primary.black[100],
  },
  seatCountError: {
    marginTop: theme.spacing(2),
    color: juralioColours.error,
  },
  infoIcon: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(0.5),
    color: rawColours.primary.blue.dark,
  },
  helpIcon: {
    width: theme.spacing(2),
    position: 'relative',
    top: theme.spacing(0.75),
  },
  internalExternalSelect: {
    marginTop: theme.spacing(2),
  },
  col: {
    width: '100%',
  },
})

const CreateUserFlowUserDetailsContent = props => {
  const dispatch = useDispatch()
  const tours = useSelector(state => state.tour.tours)
  const instanceSettings = useSelector(state => state.instanceSettings.settings)

  const [validation, setValidation] = useState({})
  const updateValue = (fieldName, value, validator, validationMessage) => {
    props.setValues({
      ...props.values,
      [fieldName]: value,
    })
    setValidation({
      ...validation,
      [fieldName]: validator(value) ? null : validationMessage,
    })
  }
  const updateMultipleValues = (
    fieldName,
    value,
    validator,
    validationMessage,
    fieldName_2,
    value_2,
    validator_2,
    validationMessage_2
  ) => {
    props.setValues({
      ...props.values,
      [fieldName]: value,
      [fieldName_2]: value_2,
    })
    setValidation({
      ...validation,
      [fieldName]: validator(value) ? null : validationMessage,
      [fieldName_2]: validator_2(value_2) ? null : validationMessage_2,
    })
  }

  useEffect(() => {
    if (props.usernameValidationMessage && !validation.email) {
      setValidation({
        ...validation,
        email: props.usernameValidationMessage,
      })
    }
  }, [props.usernameValidationMessage, validation])

  const closeTourForever = () => {
    tourService.completeTour('sysadminUserCreationOrg').then(() => {
      dispatch(clearTour())
      tourService.getTours().then(res => {
        if (res.status === 200) {
          dispatch(setAvailableTours(res.body))
        }
      })
    })
  }

  useEffect(() => {
    if (
      !props.organisation &&
      props.organisations.length !== 1 &&
      !tours.sysadminUserCreationOrg
    ) {
      dispatch(
        setTour(
          'sysadminUserCreationOrg',
          sysadminUserCreationOrgSteps(props.t, closeTourForever)
        )
      )
    }
    return () => {
      dispatch(clearTour())
    }
  }, []) // eslint-disable-line

  const clearCurrentTour = () => {
    dispatch(clearTour())
  }

  const handleUsernamesUpdate = (usernames, errors) => {
    updateMultipleValues(
      'emails',
      usernames,
      () => true,
      null,
      'emailErrors',
      errors,
      () => true,
      null
    )
  }

  return (
    <div
      data-test="add-user-panel"
      className={props.classes.column}
      onFocus={clearCurrentTour}
    >
      {!props.isCreateSysadminFlow && (
        <div className={props.classes.row}>
          {!props.organisation && props.organisations.length !== 1 && (
            <FormControl className={props.classes.formControl}>
              <InputLabel id="user-creation-organisation-picker">
                {props.t('userCreateDetails.organisationLabel')}
              </InputLabel>
              <Select
                labelId={'user-creation-organisation-picker'}
                className={props.classes.organisation}
                onChange={e => {
                  updateValue(
                    'organisation',
                    props.organisations.find(org => org.id === e.target.value),
                    () => true,
                    null
                  )
                }}
                value={
                  props.values.organisation ? props.values.organisation.id : ''
                }
                data-test="organisation"
              >
                {props.organisations.map(organisation => (
                  <MenuItem key={organisation.id} value={organisation.id}>
                    {organisation.name}
                  </MenuItem>
                ))}
              </Select>
              {(!props.values.organisation ||
                props.values.organisation?.id < 0) && (
                <FormHelperText>
                  <div className={props.classes.orgWarning}>
                    <WarningIcon className={props.classes.warningIcon} />
                    <p data-test="no-org-warning">
                      {props.t('userCreateDetails.organisationHelperText')}
                    </p>
                  </div>
                </FormHelperText>
              )}
            </FormControl>
          )}
        </div>
      )}

      <div className={props.classes.row}>
        <BulkAddUserComponent
          class={props.classes.email}
          update={handleUsernamesUpdate}
          multiple={!props.isCreateSysadminFlow}
        />

        {!props.isCreateSysadminFlow && (
          <Tooltip
            title={
              instanceSettings.limitedSeats === 0
                ? props.t('userCreateDetails.noLimited')
                : instanceSettings.fullSeats === 0
                  ? props.t('userCreateDetails.noFull')
                  : ''
            }
          >
            <span>
              <FormControl
                disabled={
                  instanceSettings.limitedSeats === 0 ||
                  instanceSettings.fullSeats === 0
                }
                className={props.classes.internalUserDropdown}
              >
                <Select
                  value={props.isExternalUser}
                  data-test="internal-external-dropdown"
                  label={props.t('auth.internal')}
                  onChange={e => props.setIsExternalUser(e.target.value)}
                >
                  <MenuItem key={'internal'} value={false}>
                    {props.t('auth.internal')}
                  </MenuItem>
                  <MenuItem key={'external'} value={true}>
                    {props.t('auth.external')}
                  </MenuItem>
                </Select>
              </FormControl>
            </span>
          </Tooltip>
        )}
        {!props.isCreateSysadminFlow && (
          <Tooltip
            title={
              <>
                {props.t('userCreateDetails.internalUsers_1')}
                <HelpIcon className={props.classes.helpIcon} />
                {props.t('userCreateDetails.internalUsers_2')}
              </>
            }
          >
            <InfoIcon className={props.classes.infoIcon} />
          </Tooltip>
        )}
      </div>
      {props.seatCountError !== '' && (
        <Typography
          className={props.classes.seatCountError}
          variant={'caption'}
        >
          {props.seatCountError}
        </Typography>
      )}
      <Typography className={props.classes.emailHelperText} variant={'caption'}>
        {props.t('userCreateDetails.emailWillBeSent')}
      </Typography>
    </div>
  )
}

export default withTranslation()(
  withStyles(CreateUserFlowUserDetailsContent, styles)
)
