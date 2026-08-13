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

import { DialogContent, InputAdornment, TextField } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import JuralioDialog from '../../components/dialog/juralio-dialog/JuralioDialog'
import { MAX_FIELD_LENGTHS } from '../constants'
import { updateTemplateNameNoFetch } from '../template/template-actions'
import templateService from '../../services/template/template-service'
import projectService from '../../services/project/project-service'
import { isInTemplate } from '../../components/navigation/common/location-context-helper'
import { useLocation } from 'react-router'
import { updateMatterDetails } from '../matter-details/matter-details-actions'
import { updateWorksreamNameNoFetch } from '../project/project-actions'
import JurMatter from '../../assets/images/JurMatter'
import JurWorkstream from '../../assets/images/JurWorkstream'

const style = makeStyles()(theme => ({
  textField: {
    width: '100%',
  },
}))

const RenameDialog = props => {
  const location = useLocation()
  const { showRenameDialog, setShowRenameDialog, isMatterOverview } = props
  const dispatch = useDispatch()
  const { classes } = style()
  const { t } = useTranslation()

  const [editNameError, setEditNameError] = useState(null)
  const matterDetails = useSelector(state => state.matterDetails)
  const template = useSelector(state => state.template.template)
  const isTemplate = isInTemplate(window.location.href)
  const project = useSelector(state => state.project)
  const [value, setValue] = useState(
    isMatterOverview
      ? matterDetails.matter.name
      : !isTemplate
        ? project.name
        : template.name
  )

  const SWM =
    !isTemplate &&
    (isMatterOverview || matterDetails?.overview?.workstreams.length < 2)

  const updateName = value => {
    setEditNameError(null)
    if (isTemplate) {
      if (value === template.name) {
        return
      }
      let isValid =
        value.length > 0 && value.length <= MAX_FIELD_LENGTHS.TEMPLATE_NAME
      if (isValid) {
        templateService
          .updateTemplate(template.id, { name: value })
          .then(res => {
            if (res.status !== 200) {
              setEditNameError(res?.body?.errors[0]?.message)
            } else {
              dispatch(updateTemplateNameNoFetch(value))
              setShowRenameDialog(false)
            }
          })
      } else {
        if (value.length === 0) {
          setEditNameError(t('simpleEdit.template.noEmptyTemplateName'))
        } else if (value.length > MAX_FIELD_LENGTHS.MATTER_NAME) {
          setEditNameError(t('simpleEdit.template.templateNameTooLong'))
        } else {
          setEditNameError(t('simpleEdit.template.unknownError'))
        }
      }
      return
    }
    if (isMatterOverview) {
      if (value === matterDetails.overview.name) {
        return
      }
      let isValid =
        value.length > 0 && value.length <= MAX_FIELD_LENGTHS.MATTER_NAME
      if (isValid) {
        dispatch(
          updateMatterDetails(matterDetails.overview.id, { name: value })
        )
        setShowRenameDialog(false)
      } else {
        if (value.length === 0) {
          setEditNameError(t('simpleEdit.matter.noEmptyMatterName'))
        } else if (value.length > MAX_FIELD_LENGTHS.MATTER_NAME) {
          setEditNameError(t('simpleEdit.matter.matterNameTooLong'))
        } else {
          setEditNameError(t('simpleEdit.matter.unknownError'))
        }
      }
    } else {
      //workstream
      if (value === project.name) {
        return
      }
      let isValid =
        value.length > 0 && value.length <= MAX_FIELD_LENGTHS.PROJECT_NAME
      if (isValid) {
        projectService
          .updateProject(matterDetails.matter.id, project.id, {
            name: value,
          })
          .then(res => {
            if (res.status !== 200) {
              setEditNameError(res?.body?.errors[0]?.message)
            } else {
              dispatch(updateWorksreamNameNoFetch(value))
              setShowRenameDialog(false)
            }
          })
      } else {
        if (value.length === 0) {
          setEditNameError(t('simpleEdit.workstream.noEmptyWorkstreamName'))
        } else if (value.length > MAX_FIELD_LENGTHS.MATTER_NAME) {
          setEditNameError(t('simpleEdit.workstream.workstreamNameTooLong'))
        } else {
          setEditNameError(t('simpleEdit.workstream.unknownError'))
        }
      }
    }
  }

  return (
    <JuralioDialog
      disableSingleClickAction={true}
      actionLabel={t('common.confirm')}
      onClose={() => setShowRenameDialog(false)}
      open={showRenameDialog}
      handleCancel={() => setShowRenameDialog(false)}
      handleAction={() => {
        updateName(value)
      }}
      titleText={
        isMatterOverview
          ? t('renameDialog.renameMatter')
          : t('renameDialog.renameWorkstream')
      }
      titleIcon={isMatterOverview ? JurMatter : JurWorkstream}
    >
      <DialogContent>
        <TextField
          className={classes.textField}
          value={value}
          onChange={e => setValue(e.target.value)}
          label={
            isMatterOverview
              ? t('renameDialog.matterName')
              : !isTemplate
                ? t('renameDialog.workstreamName')
                : t('renameDialog.templateName')
          }
          data-test="rename-field"
          error={editNameError}
          helperText={editNameError}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">{`${value.length}/${MAX_FIELD_LENGTHS.TEMPLATE_NAME}`}</InputAdornment>
              ),
            },

            htmlInput: { maxLength: 70 },
          }}
        />
      </DialogContent>
    </JuralioDialog>
  )
}

export default RenameDialog
