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

import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { ORGANISATION_SELECTOR_OPTIONS } from '../../../admin/organisations/organisation-actions'

const useStyles = makeStyles()(theme => ({
  root: {
    marginTop: theme.spacing(3),
  },
  select: {
    width: '100%',
  },
}))

const OrganisationSelector = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const { organisations, currentOrganisationId, selectOrganisation } = props
  const isOrganisationUpdated =
    props?.originalOrganisation?.id !== currentOrganisationId

  return (
    <div className={classes.root} data-test="organisation-selector">
      <InputLabel shrink id="organisation-selector-label">
        {t('organisationSelector.currentOrganisation')}
      </InputLabel>
      <FormControl className={classes.select} error>
        <Select
          labelId="organisation-selector-label"
          className={classes.select}
          value={currentOrganisationId || ORGANISATION_SELECTOR_OPTIONS.NONE}
          onChange={e => selectOrganisation(e.target.value)}
          disabled={!selectOrganisation || !props.isSysAdmin}
          error={props?.originalOrganisation?.id !== currentOrganisationId}
        >
          <MenuItem
            key="org-selection-none"
            value={ORGANISATION_SELECTOR_OPTIONS.NONE}
            data-test="organisation-selection-none"
          >
            {t('organisationSelector.none')}
          </MenuItem>
          {organisations.map(o => (
            <MenuItem
              key={`org-selection-${o.id}`}
              value={`${o.id}`}
              data-test={`organisation-selection-${o.id}`}
            >
              {o.name}
            </MenuItem>
          ))}
        </Select>
        {renderOrgChangeMessage(
          t,
          props,
          isOrganisationUpdated,
          currentOrganisationId
        )}
      </FormControl>
    </div>
  )
}

const renderOrgChangeMessage = (
  t,
  props,
  isOrganisationUpdated,
  currentOrganisationId
) => {
  if (!isOrganisationUpdated) return null

  let warningText

  warningText =
    currentOrganisationId === ORGANISATION_SELECTOR_OPTIONS.NONE
      ? t('userDetails.organisationNoneWarning')
      : t('userDetails.organisationChangeWarning', {
          name: props.currentOrganisation.name,
        })

  return <FormHelperText>{warningText}</FormHelperText>
}

OrganisationSelector.propTypes = {
  organisations: PropTypes.array.isRequired,
  currentOrganisationId: PropTypes.string,
  selectOrganisation: PropTypes.func,
}

export default OrganisationSelector
