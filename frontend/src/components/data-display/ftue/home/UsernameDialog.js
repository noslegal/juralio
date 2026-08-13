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

import { Button, TextField } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import {
  checkNameIsValidLength,
  checkTextHasNonWhitespaceContent,
} from '../../../../services/helpers/text/text-util-helper'
import FTUEScreen from '../FTUEScreen'
import UsernameImage from './img/UserNameImg.svg'

const style = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'center',
    marginLeft: '25%',
    width: '100%',
  },
  button: {
    marginTop: theme.spacing(2),
  },
}))

const UsernameDialog = props => {
  const { t } = useTranslation()
  const { classes } = style()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const validateName = name =>
    name &&
    checkNameIsValidLength(name) &&
    checkTextHasNonWhitespaceContent(name)

  return (
    <FTUEScreen
      imageurl={UsernameImage}
      subTitleText={
        <div className={classes.wrapper}>
          <TextField
            label={t('userDetails.firstNameLabel')}
            className={classes.nameTextField}
            data-test="first-name-field"
            placeholder={t('userDetails.firstNameLabel')}
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          />
          <TextField
            label={t('userDetails.lastNameLabel')}
            className={classes.nameTextField}
            data-test="last-name-field"
            placeholder={t('userDetails.lastNameLabel')}
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />
          <Button
            disabled={!validateName(firstName) || !validateName(lastName)}
            variant="contained"
            className={classes.button}
            data-test="submit-names"
            color="primary"
            onClick={() => props.handleNamechange(firstName, lastName)}
          >
            Save
          </Button>
        </div>
      }
    />
  )
}
export default UsernameDialog
