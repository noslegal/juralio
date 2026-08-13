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

import { InputAdornment } from '@mui/material'
import TextField from '@mui/material/TextField'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import JuralioDialog from '../../../../../components/dialog/juralio-dialog/JuralioDialog'
import { MattersIcon } from '../../../../../theme/navigation/CommonIcons'
import { MAX_FIELD_LENGTHS, POSITIONS } from '../../../../constants'
import { useSelector } from 'react-redux'

const useStyles = makeStyles()(theme => ({
  fieldList: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
    paddingLeft: theme.spacing(7),
    justifyContent: 'space-evenly',
    height: theme.spacing(30),
  },
}))

const MatterDetailsDialog = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const { matter } = props

  const [clientName, setClientName] = useState(matter.clientName)
  const [department, setDepartment] = useState(matter.department ?? '')
  const [matterName, setMatterName] = useState(matter.name)
  const [matterReferenceNumber, setMatterReferenceNumber] = useState(
    matter.userDefinedReferenceNumber
  )
  const matterOverview = useSelector(state => state.matterDetails.overview)
  const internalGroup = matterOverview?.positionsOfGroups.find(
    x => x.group.isInternal === true
  )
  const externalGroup = matterOverview?.positionsOfGroups.find(
    x => x.group.isInternal !== true
  )

  const onClientNameChange = event => setClientName(event.target.value)
  const onDepartmentChange = event => setDepartment(event.target.value)
  const onMatterNameChange = event => setMatterName(event.target.value)
  const onMatterReferenceNumberChange = event =>
    setMatterReferenceNumber(event.target.value)
  const isSaveDisabled = clientName.length === 0 || matterName.length === 0
  let matterRefCount =
    matterReferenceNumber?.length === undefined
      ? 0
      : matterReferenceNumber.length

  return (
    <JuralioDialog
      open={true}
      onClose={props.onClose}
      handleCancel={props.handleCloseDialog}
      handleAction={() =>
        props.handleSaveDialog({
          clientName,
          department,
          matterName,
          matterReferenceNumber,
        })
      }
      titleText={t('matterAdmin.workstreams.editMatterDetails')}
      titleIcon={MattersIcon}
      actionLabel={t('common.save')}
      disabled={isSaveDisabled}
    >
      <div className={classes.fieldList}>
        <TextField
          label={t('matterDetails.placeholderClient')}
          value={clientName}
          className={classes.Textbox}
          onChange={onClientNameChange}
          placeholder={t('matterDetails.placeholderClient')}
          data-test="client-name"
          autoFocus={true}
          disabled={
            internalGroup?.position.name === POSITIONS.CLIENT.name ||
            externalGroup
          }
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">{`${clientName.length}/${MAX_FIELD_LENGTHS.CLIENT_NAME}`}</InputAdornment>
              ),
            },

            htmlInput: {
              maxLength: MAX_FIELD_LENGTHS.CLIENT_NAME,
            },
          }}
        />
        <TextField
          label={t('matterDetails.placeholderDepartment')}
          value={department}
          onChange={onDepartmentChange}
          placeholder={t('matterDetails.placeholderDepartment')}
          data-test="department"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">{`${department.length}/${MAX_FIELD_LENGTHS.DEPARTMENT}`}</InputAdornment>
              ),
            },

            htmlInput: {
              maxLength: MAX_FIELD_LENGTHS.DEPARTMENT,
            },
          }}
        />
        <TextField
          label={t('matterDetails.matterName')}
          value={matterName}
          onChange={onMatterNameChange}
          placeholder={t('matterDetails.placeholderMatter')}
          data-test="name"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">{`${matterName.length}/${MAX_FIELD_LENGTHS.MATTER_NAME}`}</InputAdornment>
              ),
            },

            htmlInput: {
              maxLength: MAX_FIELD_LENGTHS.MATTER_NAME,
            },
          }}
        />
        <TextField
          label={t('matterDetails.placeholderMatterReferenceNumber')}
          value={matterReferenceNumber}
          onChange={onMatterReferenceNumberChange}
          placeholder={t('matterDetails.placeholderMatterReferenceNumber')}
          data-test="reference-number"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">{`${matterRefCount}/${MAX_FIELD_LENGTHS.MATTER_REFERENCE_NUMBER}`}</InputAdornment>
              ),
            },

            htmlInput: {
              maxLength: MAX_FIELD_LENGTHS.MATTER_REFERENCE_NUMBER,
            },
          }}
        />
      </div>
    </JuralioDialog>
  )
}

export default MatterDetailsDialog
