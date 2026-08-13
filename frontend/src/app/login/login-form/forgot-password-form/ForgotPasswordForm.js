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

import { Button, FormGroup, Link, TextField } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { isValidEmail } from '../../../../services/helpers/text/text-util-helper'
import rawColors from '../../../../theme/raw-colours'

const style = makeStyles()(theme => ({
  wrapper: {
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(4),
  },
  input: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(2),
  },
  submit: {
    marginBottom: theme.spacing(2),
    color: 'white',
  },
  cancel: {
    cursor: 'pointer',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}))

const ForgotPasswordForm = props => {
  const { classes } = style()
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [error, setError] = useState(null)

  const handleUsernameChange = e => {
    const newValue = e.target.value
    if (isValidEmail(newValue)) {
      setError(null)
    } else {
      setError(t('login.notAValidEmailAddress'))
    }
    setUsername(newValue)
  }

  return (
    <FormGroup className={classes.wrapper}>
      <TextField
        placeholder={t('common.email')}
        value={username}
        className={classes.input}
        error={error}
        label={error ? error : ''}
        onChange={handleUsernameChange}
        data-test="forgot-password-email-field"
      />
      <Button
        disabled={error != null || username.length === 0}
        variant="contained"
        style={
          props.backgroundColor === 'true'
            ? { backgroundColor: rawColors.tips.orange }
            : { backgroundColor: rawColors.status.done.dark }
        }
        onClick={() => props.submit(username)}
        className={classes.submit}
        data-test="submit-forgot-password"
      >
        {t('login.resetPassword')}
      </Button>
      <Link
        onClick={props.cancel}
        className={classes.cancel}
        data-test="cancel"
      >
        {t('common.cancel')}
      </Link>
    </FormGroup>
  )
}
export default ForgotPasswordForm
