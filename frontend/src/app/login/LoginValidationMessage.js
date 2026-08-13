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
import { withStyles } from 'tss-react/mui' // import { withStyles } from 'tss-react/mui';
import juralioColours from '../../theme/juralio-colours'

const styles = theme => ({
  validationBox: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    marginLeft: '-24px',
    padding: theme.spacing(2, 3),
    background: juralioColours.error,
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
  selfService: {
    width: '80%',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: theme.spacing(),
  },
})

const LoginValidationMessage = props => {
  const { t } = useTranslation()

  return (
    props.validationMessage && (
      <div
        className={classNames(props.classes.validationBox, {
          [props.classes.hidden]: !props.validationMessage,
          [props.classes.selfService]: props.isSelfService,
        })}
        data-test="validation-box"
      >
        <Typography
          className={props.classes.validationMessage}
          data-test="validation-message"
          variant="body2"
        >
          {t(props.validationMessage)}
        </Typography>
      </div>
    )
  )
}

export default withStyles(LoginValidationMessage, styles)
