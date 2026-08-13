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

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import JurWebLink from '../../../assets/images/JurWebLink'
import SelectToggle from '../../../components/inputs/select-toggle/SelectToggle'
import { useIsViewOnly } from '../../../hooks/matter/viewer/matter-viewer-hooks'
import { useUserAuthData } from '../../../hooks/user-hooks'
import { isKnowledgeManager } from '../../../services/user/helper/user-role-service'
import { displayConfirmationDialog } from '../../global-confirmation-dialog/global-confirmation-dialog-actions'
import { updateTemplate } from '../template-actions'

const PublishToggle = props => {
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const templateName = useSelector(state => state.template?.template?.name)
  const template = useSelector(state => state.template.template)
  const templateDetails = useSelector(state => state.template.template)
  const isViewOnly = useIsViewOnly({ activities: [] })
  const [isPublished, setIsPublished] = useState(template?.published)
  const [dialogCancelledHandler, setDialogCancelledHandler] = useState(true)
  const postsInDraft = templateDetails?.posts?.filter(post => {
    return !post.finalised
  })

  useEffect(() => {
    setIsPublished(template.published)
  }, [template.published])

  const addNewLines = text => {
    return text.split('*').map(sentence => (
      <p>
        {sentence}
        {sentence.length > 0 && '.'}
      </p>
    ))
  }

  const userAuthData = useUserAuthData()
  if (!isKnowledgeManager(userAuthData) || !template) return null

  const draftTemplate = () => {
    dispatch(updateTemplate(template.id, { published: false }))
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

  const testOptions = () => {
    return [
      {
        optionLabel: t('templates.draft'),
        action: draftTemplate,
        selectLabel: t('templates.draft'),
        grey: true,
        toolTip: t('templates.toolTip.draft'),
      },
      {
        optionLabel: t('templates.publish'),
        action: showConfirmDialog,
        selectLabel: t('templates.published'),
        blue: true,
        toolTip: t('templates.toolTip.published'),
      },
    ]
  }

  if (template.isSystemTemplate || isViewOnly) {
    return null
  }

  return (
    <SelectToggle
      options={testOptions()}
      selectedOptionIndex={isPublished ? 1 : 0}
      disabled={template.isSystemTemplate || isViewOnly}
      dialogCancelledHandler={dialogCancelledHandler}
    />
  )
}

export default PublishToggle
