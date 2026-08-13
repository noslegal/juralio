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
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import CreateGroupDialog from '../../layouts/manage-users/CreateGroupDialog'

const useStyles = makeStyles()(theme => ({
  root: {
    marginTop: theme.spacing(3),
  },
  select: {
    width: '100%',
  },
}))

const CreateUserFlowGroupSelector = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const { values, setValues, canEdit, groups, isSysAdmin } = props
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showDialog, setShowDialog] = useState(false)

  const internalGroup = groups.filter(g => g.isInternal)[0]

  useEffect(() => {
    if (!canEdit) {
      //is internal
      setValues({ ...values, group: internalGroup.id })
    }
  }, [internalGroup]) //eslint-disable-line

  return (
    <div className={classes.root} data-test="group-selector">
      <InputLabel shrink id="group-selector-label">
        {t('Associated group')}
      </InputLabel>
      <FormControl className={classes.select}>
        <Select
          labelId="group-selector-label"
          label={'Choose a group'}
          className={classes.select}
          value={canEdit ? selectedGroup : internalGroup.id}
          onChange={e => {
            setSelectedGroup(e.target.value)
            setValues({ ...values, group: e.target.value })
          }}
          disabled={!canEdit}
        >
          {groups?.map(g => (
            <MenuItem
              key={`group-selection-${g.id}`}
              value={`${g.id}`}
              data-test={`group-selection-${g.id}`}
            >
              {g.isInternal ? g.name + '(internal)' : g.name}
            </MenuItem>
          ))}
          <Button
            onClick={() => {
              setShowDialog(true)
            }}
          >
            New Group
          </Button>
        </Select>
      </FormControl>

      <CreateGroupDialog
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        orgId={values.organisation.id}
        isSysadmin={isSysAdmin}
        setSelectedOrgGroups={props.setSelectedOrgGroups}
        groups={groups}
      />
    </div>
  )
}
export default CreateUserFlowGroupSelector
