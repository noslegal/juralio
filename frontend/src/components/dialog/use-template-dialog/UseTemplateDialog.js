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
  DialogContent,
  FormControlLabel,
  Radio,
  Typography,
} from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router'
import { withStyles } from 'tss-react/mui'
import { templateToProject } from '../../../app/template/project-creation/template-to-project-actions'
import UseFullTemplate from '../../../assets/images/template-creation-helper1.svg'
import UsePartialTemplate from '../../../assets/images/template-creation-helper2.svg'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'
import LoadingScreen from '../../loading-screen/LoadingScreen'
import {
  getTaskMapUrl,
  getTemplateIdFromLocation,
} from '../../navigation/common/location-context-helper'
import JuralioDialog from '../juralio-dialog/JuralioDialog'

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  actionsPanel: {
    flex: '0 0 auto',
    display: 'flex',
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  optionContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  radioButton: {
    alignSelf: 'center',
  },
  templateImage: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(),
    cursor: 'pointer',
  },
  caption: {
    alignSelf: 'center',
    textAlign: 'center',
    maxWidth: theme.spacing(18),
    color: juralioColours.darkText.secondary,
  },
  postsCheckboxPanel: {
    zIndex: 10,
    position: 'absolute',
    left: theme.spacing(8.75),
    display: 'flex',
    flexDirection: 'column',
  },
  includePostsIcon: {
    marginTop: theme.spacing(1),
    color: rawColours.primary.primary.main,
  },
})

const UseTemplateDialog = props => {
  const location = useLocation()
  const history = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const template = useSelector(state => state.template.template)
  const includePosts = useSelector(
    state => state.templateToProject.includePosts
  )
  const includeDescriptions = useSelector(
    state => state.templateToProject.includeDescriptions
  )
  const useFullTemplate = useSelector(
    state => state.templateToProject.useFullTemplate
  )

  const templateId = parseInt(getTemplateIdFromLocation(location))
  const instanceSettings = useSelector(state => state.instanceSettings)
  const [templateFirstTimeFlow, setTemplateFirstTimeFlow] = useState(false)
  const [checkedIncludePosts, setCheckedIncludePosts] = useState(includePosts)
  const [checkedIncludeDescriptions, setCheckedIncludeDescriptions] =
    useState(includeDescriptions)
  const handleFullPartialTemplateChange = event =>
    dispatch(templateToProject.updateUseFullTemplate(!useFullTemplate))

  const handleIncludePostsChange = event => {
    setCheckedIncludePosts(!checkedIncludePosts)
    dispatch(templateToProject.updateIncludePostsOption(!checkedIncludePosts))
  }

  const handleIncludeDescriptionsChange = event => {
    setCheckedIncludeDescriptions(!checkedIncludeDescriptions)
    dispatch(
      templateToProject.updateIncludeDescriptionsOption(
        !checkedIncludeDescriptions
      )
    )
  }
  const handleConfirmTemplateOptionSelection = event =>
    dispatch(templateToProject.updateUseTemplateOptionConfirmed(true))

  useEffect(() => {
    if (instanceSettings.settings.initialTemplateId === templateId) {
      //&&sessionStorage flow is true
      setTemplateFirstTimeFlow(true)
      props.handleCreateTutorial(templateId, template.name).then(response => {
        if (response.status === 201) {
          history(
            getTaskMapUrl(undefined, response.body.matter.id, response.body.id)
          )
          setTemplateFirstTimeFlow(false)
        } else {
          setTemplateFirstTimeFlow(false)
        }
      })
    }
  }, [dispatch, templateId, instanceSettings.settings.initialTemplateId]) //eslint-disable-line

  return (
    <JuralioDialog
      loadingText={t('templates.creation')}
      hideAction={templateFirstTimeFlow}
      hideCancel={templateFirstTimeFlow}
      showLoadingBar={templateFirstTimeFlow}
      data-test="destination-dialog"
      open={true}
      onClose={props.cancelHandler}
      fullScreen={props.fullScreen}
      className={props.classes.root}
      titleText={props.titleText}
      titleIcon={props.titleIcon}
      handleAction={handleConfirmTemplateOptionSelection}
      handleCancel={props.cancelHandler}
      actionLabel={t('common.next')}
      disabled={false}
      usageContext="ProjectFromTemplateDialog"
      context={'templateUsageType'}
    >
      {templateFirstTimeFlow ? (
        <DialogContent>
          <LoadingScreen />
        </DialogContent>
      ) : (
        <>
          <DialogContent className={props.classes.dialogContent}>
            <div className={props.classes.optionContainer}>
              <Typography
                variant="body1"
                data-test="use-full-template-heading"
                className={props.classes.caption}
              >
                {t('templates.useEntireTemplate')}
              </Typography>

              <img
                src={UseFullTemplate}
                alt={t('templates.fullTemplateAlt')}
                className={props.classes.templateImage}
                onClick={() => {
                  dispatch(templateToProject.updateUseFullTemplate(true))
                }}
              />
              <Radio
                className={props.classes.radioButton}
                checked={useFullTemplate}
                onChange={handleFullPartialTemplateChange}
                value="full"
                name="radio-button-full"
                data-test="use-full-template-radio"
              />
            </div>
            <div className={props.classes.optionContainer}>
              <Typography
                variant="body1"
                data-test="use-partial-template-heading"
                className={props.classes.caption}
              >
                {t('templates.usePartialTemplate')}
              </Typography>

              <img
                src={UsePartialTemplate}
                alt={t('templates.partialTemplateAlt')}
                className={props.classes.templateImage}
                onClick={() => {
                  dispatch(templateToProject.updateUseFullTemplate(false))
                }}
              />
              <Radio
                className={props.classes.radioButton}
                checked={!useFullTemplate}
                onChange={handleFullPartialTemplateChange}
                value="partial"
                name="radio-button-partial"
                data-test="use-partial-template-radio"
              />
            </div>
          </DialogContent>

          <div className={props.classes.postsCheckboxPanel}>
            <FormControlLabel
              control={
                <Checkbox
                  data-test="include-descriptions"
                  color="primary"
                  checked={checkedIncludeDescriptions}
                  onChange={handleIncludeDescriptionsChange}
                />
              }
              label={t('templates.includeDescriptions')}
            ></FormControlLabel>
            <div className={props.classes.row}>
              <FormControlLabel
                control={
                  <Checkbox
                    data-test="include-posts"
                    color="primary"
                    checked={checkedIncludePosts}
                    onChange={handleIncludePostsChange}
                  />
                }
                label={t('templates.includePosts')}
              ></FormControlLabel>
            </div>
          </div>
        </>
      )}
    </JuralioDialog>
  )
}

export default withStyles(UseTemplateDialog, styles)
