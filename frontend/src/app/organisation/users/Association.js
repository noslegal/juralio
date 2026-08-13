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

import { FormControlLabel, Radio, Tooltip, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'

const styles = theme => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  radioButton: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(4),
  },
  rolesHeader: {
    marginBottom: theme.spacing(),
  },
})

const Association = props => {
  const { t } = useTranslation()

  if (props.isExternalUser === undefined || !props.setIsExternalUser)
    return null

  return (
    <Fragment>
      <Typography
        className={props.classes.rolesHeader}
        variant="overline"
        data-test="association-option-title"
        noWrap
      >
        {t('userCreation.association')}
      </Typography>
      <Tooltip
        title={props.toolltip ? t('userCreation.associationTooltip') : ''}
      >
        <div className={props.classes.row}>
          <FormControlLabel
            data-test="internal-radio-button"
            className={props.classes.radioButton}
            value="end"
            control={<Radio color="secondary" />}
            label={
              <Typography variant="body2">{t('auth.internal')}</Typography>
            }
            checked={!props.isExternalUser}
            onChange={() => props.setIsExternalUser(false)}
            disabled={props.disabled}
          />
          <FormControlLabel
            data-test="external-radio-button"
            className={props.classes.radioButton}
            value="end"
            control={<Radio color="secondary" />}
            label={
              <Typography variant="body2">{t('auth.external')}</Typography>
            }
            checked={props.isExternalUser}
            onChange={() => props.setIsExternalUser(true)}
            disabled={props.disabled}
          />
        </div>
      </Tooltip>
    </Fragment>
  )
}

Association.propTypes = {
  /** external/internal */
  isExternalUser: PropTypes.bool.isRequired,
  /** function to set association */
  setIsExternalUser: PropTypes.func.isRequired,
  /** Radio buttons disabled */
  disabled: PropTypes.bool,
}

export default withStyles(Association, styles)
