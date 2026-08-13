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
  InputAdornment,
  TextField,
  Select,
  MenuItem,
  Typography,
} from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { MAX_FIELD_LENGTHS } from '../constants'

const useStyles = makeStyles()(theme => ({
  fieldList: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    gap: theme.spacing(2),
  },
  positionRow: {
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'flex-start',
  },
  positionSelect: {
    flex: 1,
  },
  referenceField: {
    flex: 1,
  },
}))

const NewMatterDetailsDialog = props => {
  const {
    clientName,
    department,
    matterName,
    matterReferenceNumber,
    onClientChange,
    onDepartmentChange,
    onMatterChange,
    onMatterReferenceNumberChange,
    position,
    setPosition,
    userData,
  } = props
  const { classes } = useStyles()
  const { t } = useTranslation()

  return (
    <div className={classes.fieldList}>
      <Typography variant="caption">
        {t('matterDetails.positionHelper', {
          groupName: userData.organisationGroup.name,
        })}
      </Typography>
      <div className={classes.positionRow}>
        <Select
          value={position}
          label="Position"
          onChange={e => {
            setPosition(e.target.value)
          }}
          variant="outlined"
          className={classes.positionSelect}
          data-test="position-select"
        >
          <MenuItem value={0} data-test="position-option-client">
            {t('matterDetails.client')}
          </MenuItem>
          <MenuItem value={1} data-test="position-option-advisor">
            {t('matterDetails.advisor')}
          </MenuItem>
        </Select>
        <TextField
          helperText={t('matterDetails.matterRefHelper')}
          label={t('matterDetails.placeholderMatterReferenceNumber')}
          slotProps={{
            htmlInput: {
              maxLength: MAX_FIELD_LENGTHS.MATTER_REFERENCE_NUMBER,
            },
            input: {
              endAdornment: (
                <InputAdornment position="end">{`${matterReferenceNumber.length}/${MAX_FIELD_LENGTHS.MATTER_REFERENCE_NUMBER}`}</InputAdornment>
              ),
            },
          }}
          value={matterReferenceNumber}
          className={classes.referenceField}
          onChange={onMatterReferenceNumberChange}
          placeholder={t('matterDetails.placeholderMatterReferenceNumber')}
          data-test="reference-number"
        />
      </div>
      <TextField
        disabled={position === 0}
        label={t('matterDetails.placeholderClient')}
        value={clientName}
        className={classes.Textbox}
        slotProps={{
          htmlInput: {
            maxLength: MAX_FIELD_LENGTHS.CLIENT_NAME,
          },
          input: {
            endAdornment: (
              <InputAdornment position="end">{`${clientName.length}/${MAX_FIELD_LENGTHS.CLIENT_NAME}`}</InputAdornment>
            ),
          },
        }}
        onChange={onClientChange}
        placeholder={t('matterDetails.placeholderClient')}
        data-test="client-name"
        autoFocus={true}
      />
      <TextField
        helperText={t('matterDetails.departmentHelper')}
        label={t('matterDetails.placeholderDepartment')}
        value={department}
        className={classes.Textbox}
        slotProps={{
          htmlInput: {
            maxLength: MAX_FIELD_LENGTHS.DEPARTMENT,
          },
          input: {
            endAdornment: (
              <InputAdornment position="end">{`${department.length}/${MAX_FIELD_LENGTHS.DEPARTMENT}`}</InputAdornment>
            ),
          },
        }}
        onChange={onDepartmentChange}
        data-test="department"
      />
      <TextField
        required
        helperText={t('matterDetails.matterNameHelper')}
        label={t('matterDetails.matterName')}
        slotProps={{
          htmlInput: {
            maxLength: MAX_FIELD_LENGTHS.MATTER_NAME,
          },
          input: {
            endAdornment: (
              <InputAdornment position="end">{`${matterName.length}/${MAX_FIELD_LENGTHS.MATTER_NAME}`}</InputAdornment>
            ),
          },
        }}
        value={matterName}
        className={classes.Textbox}
        onChange={onMatterChange}
        placeholder={t('matterDetails.placeholderMatter')}
        data-test="name"
      />
    </div>
  )
}

export default NewMatterDetailsDialog
