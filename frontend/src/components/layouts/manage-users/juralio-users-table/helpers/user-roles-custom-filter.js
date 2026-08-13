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
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from '@mui/material'

export const UserRolesFilterInput = ({
  item,
  applyValue,
  isOrganisation,
  t,
}) => {
  const optionValues = [
    t('userList.orgadmin'),
    t('userList.matterCreator'),
    t('userList.knowledgeManager'),
    t('userList.orgOwner'),
  ]
  if (isOrganisation) {
    optionValues.shift()
  }
  const value = item.value ?? []
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel htmlFor="roles-filter">
        {t('userList.headerRoles')}
      </InputLabel>
      <Select
        multiple
        label={t('userList.headerRoles')}
        value={value}
        renderValue={selected => selected.join(', ')}
        onChange={event => applyValue({ ...item, value: event.target.value })}
      >
        {optionValues.map(roleLabel => (
          <MenuItem key={roleLabel} value={roleLabel}>
            <Checkbox color="primary" checked={value.indexOf(roleLabel) > -1} />
            <ListItemText primary={roleLabel} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
