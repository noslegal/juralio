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

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import organisationService from '../../../services/organisation/organisation-service'

const useStyles = makeStyles()(theme => ({
  root: {
    marginTop: theme.spacing(3),
  },
  select: {
    width: '100%',
  },
}))

const GroupSelector = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const { currentGroupId, canEdit, isSysAdmin, allGroups } = props
  const [groups, setGroups] = useState([])

  useEffect(() => {
    if (props.currentOrgId && !isSysAdmin) {
      organisationService.getGroupsForOrg(props.currentOrgId).then(res => {
        if (res.status === 200) {
          setGroups(res.body)
        }
      })
    } else if (props.currentOrgId) {
      setGroups(
        allGroups.filter(
          g => g.organisation.id === parseInt(props.currentOrgId)
        )
      )
    }
  }, [props.currentOrgId]) //eslint-disable-line

  return (
    <div className={classes.root} data-test="group-selector">
      <InputLabel shrink id="group-selector-label">
        {t('Associated group')}
      </InputLabel>
      <FormControl className={classes.select} error>
        <Select
          labelId="group-selector-label"
          className={classes.select}
          value={`${currentGroupId}`}
          onChange={e => {
            let chosenGroup = groups.find(
              g => g.id === parseInt(e.target.value)
            )
            props.updateValue('group', chosenGroup)
          }}
          disabled={!canEdit}
          error={false}
        >
          {groups?.map(g => (
            <MenuItem
              key={`group-selection-${g.id}`}
              value={`${g.id}`}
              data-test={`group-selection-${g.id}`}
            >
              {g.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}
export default GroupSelector
