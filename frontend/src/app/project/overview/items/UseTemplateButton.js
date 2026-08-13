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

import { Button } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import CreateProjectFromTemplateFlowContainer from '../../../../components/flows/use-template-flow/CreateProjectFromTemplateFlowContainer'
import { useIsViewOnly } from '../../../../hooks/matter/viewer/matter-viewer-hooks'
import { clearTour } from '../../../../services/tour/tour-actions'
import juralioColours from '../../../../theme/juralio-colours'
import { templateToProject } from '../../../template/project-creation/template-to-project-actions'
import {
  fetchIsTemplateFavourited,
  updateTemplate,
} from '../../../template/template-actions'
import { displayConfirmationDialog } from '../../../global-confirmation-dialog/global-confirmation-dialog-actions'
import JurWebLink from '../../../../assets/images/JurWebLink'
import rawColours from '../../../../theme/raw-colours'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
    marginRight: theme.spacing(1),
  },
  button: {
    textTransform: 'none',
    paddingLeft: theme.spacing(0.75),
    paddingRight: theme.spacing(0.75),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
    boxShadow: 'unset',
    height: theme.spacing(4),
  },
}))

const UseTemplateButton = props => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const templateId = useSelector(state => state.template.template.id)
  const isPublished = useSelector(state => state.template.template.published)
  const tasks = useSelector(state => state.template.template.tasks)
  const isFavourited = useSelector(
    state => state.template.template.isFavourited
  )
  const taskFromTemplate = useSelector(
    state => state.improvedTaskmap.taskFromTemplate
  )
  const templateName = useSelector(state => state.template?.template?.name)
  const template = useSelector(state => state.template.template)
  const [dialogCancelledHandler, setDialogCancelledHandler] = useState(true)
  const [favourite, setFavourite] = useState(isFavourited)
  const isViewOnly = useIsViewOnly({ activities: [] })
  const templateDetails = useSelector(state => state.template.template)
  const postsInDraft = templateDetails?.posts?.filter(post => {
    return !post.finalised
  })

  useEffect(() => {
    if (templateId) {
      dispatch(fetchIsTemplateFavourited(templateId))
    }
  }, [dispatch, templateId])

  useEffect(() => {
    if (isFavourited !== undefined) {
      setFavourite(isFavourited)
    }
  }, [isFavourited])
  const [renderDialog, setRenderDialog] = useState(false)
  const { classes } = useStyles()
  const cancelHandler = () => {
    dispatch(templateToProject.resetTemplateToProjectState())
    setRenderDialog(false)
  }

  const addNewLines = text => {
    return text.split('*').map(sentence => (
      <p>
        {sentence}
        {sentence.length > 0 && '.'}
      </p>
    ))
  }

  const publishTemplate = () => {
    dispatch(updateTemplate(template.id, { published: true }))
  }

  const showConfirmDialog = () => {
    dispatch(
      displayConfirmationDialog(
        {
          actionText: t('common.confirm'),
          titleText: t('templates.confirmPublish', {
            templateName: templateName,
          }),
          promptText:
            postsInDraft === undefined || postsInDraft?.length === 0
              ? t('templates.confirmPublishDescription1')
              : addNewLines(t('templates.confirmPublishDescription2')),
          headerIcon: JurWebLink,
          cancel: () => setDialogCancelledHandler(!dialogCancelledHandler),
          dontTranslatePromptText: true,
        },
        () => {
          publishTemplate()
        }
      )
    )
  }

  return (
    <div className={classes.root}>
      {renderDialog && (
        <CreateProjectFromTemplateFlowContainer cancelHandler={cancelHandler} />
      )}
      <Button
        style={
          isPublished
            ? { backgroundColor: rawColours.primary.primary.main }
            : {
                backgroundColor: juralioColours.useTemplateButton.useButton,
                color: rawColours.primary.darkBlue.main,
                border: '1px solid',
                borderColor: rawColours.primary.darkBlue.main,
                '&:hover': {
                  backgroundColor: juralioColours.useTemplateButton.useButton,
                },
              }
        }
        disableElevation={true}
        variant="contained"
        data-test={!isPublished ? 'publish-template' : 'use-template-button'}
        onClick={() => {
          if (!isPublished) {
            showConfirmDialog()
          } else {
            if (window.sessionStorage.getItem('onInitialTutorial') === 'true') {
              dispatch(clearTour())
            }
            setRenderDialog(true)
          }
        }}
        className={classes.button}
        disabled={!tasks || tasks.length === 0 || isViewOnly}
      >
        {!isPublished
          ? t('Publish this template')
          : t('templateOverview.useThisTemplate')}
      </Button>
    </div>
  )
}

export default UseTemplateButton
