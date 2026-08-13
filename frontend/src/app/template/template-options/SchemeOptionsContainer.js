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

import CreateIcon from '@mui/icons-material/Create'
import DeleteIcon from '@mui/icons-material/Delete'
import { DialogContent, TextField } from '@mui/material'
import React, { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import ConfirmationDialog from '../../../components/dialog/confirmation-dialog/ConfirmationDialog'
import JuralioDialog from '../../../components/dialog/juralio-dialog/JuralioDialog'
import { checkTextHasNonWhitespaceContent } from '../../../services/helpers/text/text-util-helper'
import juralioColours from '../../../theme/juralio-colours'
import { MAX_FIELD_LENGTHS } from '../../constants'
import TemplateCopyDialogContainer from '../overview/template-copy/TemplateCopyDialogContainer'

const useStyles = makeStyles()(theme => ({
  root: {},
  renameErrorText: {
    fontFamily: theme.typography.fontFamily,
    color: juralioColours.named.red.main,
    fontSize: theme.spacing(1.5),
  },
}))

const SchemeOptionsContainer = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  const { isEditingName, isTemplate, showCopyDialog, showDeleteDialog } = props

  const [renameName, setRenameName] = useState(props.name)
  const [renameError, setRenameError] = useState(null)

  useEffect(() => {
    setRenameName(props.name)
  }, [props.name])

  if (renameName === undefined || renameName === null) return null

  return (
    <Fragment>
      {isEditingName && (
        <JuralioDialog
          open={true}
          disabled={renameError !== null}
          titleText={t(
            isTemplate
              ? 'templateOverview.rename'
              : 'projectOverview.rename.title'
          )}
          titleIcon={CreateIcon}
          handleClose={() => {
            props.editing.clearEditing()
          }}
          handleCancel={() => {
            setRenameError(null)
            setRenameName(props.project.name)
            props.editing.clearEditing()
          }}
          handleAction={() => {
            if (renameName === props.project.name) {
              props.editing.clearEditing()
            } else {
              props.editing.saveName(renameName)
            }
          }}
          actionLabel={t('operationMenuItem.rename')}
          onClose={() => {
            setRenameError(null)
            setRenameName(props.project.name)
            props.editing.clearEditing()
          }}
        >
          <DialogContent>
            <TextField
              data-test="rename-text-box"
              label={t(
                isTemplate
                  ? 'templates.createTemplateNamePlaceholder'
                  : 'projectCreation.projectName'
              )}
              value={renameName}
              fullWidth
              maxLength={
                isTemplate
                  ? MAX_FIELD_LENGTHS.TEMPLATE_NAME
                  : MAX_FIELD_LENGTHS.PROJECT_NAME
              }
              onChange={e => {
                let name = e.target.value
                setRenameName(name)
                if (!name.length)
                  setRenameError(t('projectCreation.cannotBeEmpty'))
                else if (!isTemplate && props.projects.includes(name))
                  setRenameError(
                    t('projectCreation.projectNameUniquePerMatter')
                  )
                else if (!checkTextHasNonWhitespaceContent(name)) {
                  setRenameError(t('projectCreation.genericNamingError'))
                } else setRenameError(null)
              }}
            />
            {renameError && (
              <p className={classes.renameErrorText}>{renameError}</p>
            )}
          </DialogContent>
        </JuralioDialog>
      )}
      {showDeleteDialog && (
        <JuralioDialog open={true}>
          <ConfirmationDialog
            titleText={t('templateOverview.deletion.deleteTemplateQuestion')}
            headerIcon={DeleteIcon}
            promptText={t('templateOverview.deletion.deleteTemplatePrompt')}
            actionText={t('common.delete')}
            cancelHandler={props.setShowDeleteDialog}
            actionHandler={props.deleteTemplate}
            warningText={null}
          />
        </JuralioDialog>
      )}
      {showCopyDialog && (
        <TemplateCopyDialogContainer cancelHandler={props.setShowCopyDialog} />
      )}
    </Fragment>
  )
}

export default SchemeOptionsContainer
