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

import CopyIcon from '@mui/icons-material/FileCopy'
import { Checkbox, FormControl, FormControlLabel } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { MAX_FIELD_LENGTHS } from '../../../../app/constants'
import TextPromptDialog from '../../../../components/dialog/text-prompt-dialog/TextPromptDialog'
import IsWidthDown from '../../../../hooks/width-helper'
const useStyles = makeStyles()(theme => ({
  postForm: {
    marginTop: theme.spacing(27.5),
  },
}))

//** Copy Template Dialog */
const TemplateCopyDialog = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const fullScreenMode = IsWidthDown('sm', props.width)

  return (
    <TextPromptDialog
      className={classes.root}
      titleText={t('templateOverview.copy.copyTemplate')}
      actionText={t('common.create')}
      placeholderText={t('templateOverview.copy.nameYourNewTemplate')}
      usageContext="CopyTemplate"
      fullScreen={fullScreenMode}
      cancelHandler={props.cancelHandler}
      titleIcon={CopyIcon}
      maximumLength={MAX_FIELD_LENGTHS.TEMPLATE_NAME}
      actionHandler={props.copyTemplateHandler}
      AdditionalFields={
        <FormControl className={classes.postForm}>
          <FormControlLabel
            control={
              <Checkbox
                data-test="include-posts-checkbox"
                color="primary"
                className={classes.postCheckbox}
                checked={props.includePosts}
                onClick={() => {
                  props.setIncludePosts(!props.includePosts)
                }}
              />
            }
            label={t('templates.includePosts')}
          ></FormControlLabel>
        </FormControl>
      }
    />
  )
}

TemplateCopyDialog.propTypes = {
  /** handler for copying the template */
  copyTemplateHandler: PropTypes.func.isRequired,
  /** handler for cancelling the operation */
  cancelHandler: PropTypes.func.isRequired,
}

export default TemplateCopyDialog
