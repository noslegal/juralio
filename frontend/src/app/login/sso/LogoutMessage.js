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

import { Typography } from '@mui/material'
import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'
import rawColours from '../../../theme/raw-colours'
import { API_ERROR_CODE } from '../../constants'
const styles = theme => ({
  validationBox: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    marginLeft: '-24px',
    padding: theme.spacing(2, 3),
    background: rawColours.primary.primary.main,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  validationMessage: {
    textAlign: 'center',
    whiteSpace: 'pre-line',
    color: 'white',
  },
  hidden: {
    visibility: 'hidden',
  },
})

const LogoutMessage = props => {
  const { t } = useTranslation()
  const capitalise = str => str.charAt(0).toUpperCase() + str.slice(1)
  const generateMessage = () => {
    if (props.ssoType === API_ERROR_CODE.USER_LOCKED) {
      return t('login.userLocked')
    }
    return t('sso.logout', { provider: capitalise(props.ssoType) })
  }

  return (
    <div
      className={classNames(props.classes.validationBox, {})}
      data-test="validation-box"
    >
      <Typography
        className={props.classes.validationMessage}
        data-test="validation-message"
        variant="body2"
      >
        {generateMessage()}
      </Typography>
    </div>
  )
}

export default withStyles(LogoutMessage, styles)
