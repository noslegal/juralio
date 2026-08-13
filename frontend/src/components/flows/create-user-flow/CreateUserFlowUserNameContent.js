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

import { FormControlLabel, FormGroup, TextField } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'

const style = makeStyles()(theme => ({
  wrapper: {},
  label: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  textField: {
    width: theme.spacing(50),
  },
}))

const CreateUserFlowUserNameContent = props => {
  const { t } = useTranslation()
  const { values, setValues } = props
  const { classes } = style()
  const setFirstName = name => {
    values.firstname = name
    setValues(values)
  }
  const setLastName = name => {
    values.lastname = name
    setValues(values)
  }

  return (
    <div className={classes.wrapper}>
      <FormGroup>
        <FormControlLabel
          className={classes.label}
          control={
            <TextField
              className={classes.textField}
              data-test="firstname"
              label={t('userCreateDetails.firstNameLabel')}
              onChange={e => {
                e.stopPropagation()
                setFirstName(e.target.value)
              }}
            />
          }
        />
        <FormControlLabel
          className={classes.label}
          control={
            <TextField
              className={classes.textField}
              data-test="lastname"
              label={t('userCreateDetails.lastNameLabel')}
              onChange={e => {
                e.stopPropagation()
                setLastName(e.target.value)
              }}
            />
          }
        />
      </FormGroup>
    </div>
  )
}
export default CreateUserFlowUserNameContent
