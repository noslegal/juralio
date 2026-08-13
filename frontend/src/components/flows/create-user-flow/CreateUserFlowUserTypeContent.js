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

import { RadioGroup } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { withTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import RadioButton from '../../inputs/radioButton/RadioButton'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    width: '100%',
  },
}))

const CreateUserFlowUserTypeContent = props => {
  const { organisation } = props
  const { classes } = useStyles()

  return (
    <>
      <RadioGroup
        onChange={e => {
          props.onChange(e.target.value)
        }}
        value={props.value}
        className={classes.root}
      >
        <RadioButton
          value={props.t('userCreation.userTypes.juralio')}
          title={props.t('userCreation.authenticationTypes.juralio')}
          labelPlacement={'right'}
        />
        {organisation?.microsoftSsoEnabled && (
          <RadioButton
            value={props.t('userCreation.userTypes.microsoft')}
            title={props.t('userCreation.authenticationTypes.microsoft')}
            labelPlacement={'right'}
          />
        )}
        {organisation?.oktaSsoEnabled && (
          <RadioButton
            value={props.t('userCreation.userTypes.okta')}
            title={props.t('userCreation.authenticationTypes.okta')}
            labelPlacement={'right'}
          />
        )}
        {organisation?.samlSsoEnabled && (
          <RadioButton
            value={props.t('userCreation.userTypes.saml')}
            title={props.t('userCreation.authenticationTypes.saml')}
            labelPlacement={'right'}
          />
        )}
        {organisation?.googleSsoEnabled && (
          <RadioButton
            value={props.t('userCreation.userTypes.google')}
            title={props.t('userCreation.authenticationTypes.google')}
            labelPlacement={'right'}
          />
        )}
      </RadioGroup>
    </>
  )
}

CreateUserFlowUserTypeContent.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string,
}

export default withTranslation()(CreateUserFlowUserTypeContent)
