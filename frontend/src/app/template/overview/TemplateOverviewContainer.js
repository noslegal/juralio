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

import HideImageIcon from '@mui/icons-material/HideImage'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import BackToListLink from '../../../components/navigation/back-to-list-link/BackToListLink'
import BigDataSpinner from '../../../components/feedback/big-data-spinner/BigDataSpinner'
import { connect, useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router'
import { bindActionCreators } from 'redux'
import { withStyles } from 'tss-react/mui'
import TemplateFtue from '../../../components/data-display/ftue/template/TemplateFtue'
import { useIsViewOnly } from '../../../hooks/matter/viewer/matter-viewer-hooks'
import { useUserRole } from '../../../hooks/user-hooks'
import withRouter from '../../../services/navigation/WithRouter'
import templateService from '../../../services/template/template-service'
import { getDetailsAttribute } from '../../../services/user/user-data-service'
import juralioColours from '../../../theme/juralio-colours'
import { displayConfirmationDialog } from '../../global-confirmation-dialog/global-confirmation-dialog-actions'
import ProjectOverview from '../../project/overview/ProjectOverview'
import {
  deleteTemplate,
  editingActions,
  fetchTemplate,
  fetchTemplateOverviewWithPosts,
  fetchTemplateTasks,
  reset,
  resetOverview,
  resetTemplateErrorMessage,
  showCopyTemplateDialog,
  showDeleteTemplateDialog,
  updateTemplate,
  updateTemplateImageNoFetch,
} from '../template-actions'
import { getTemplateIdFromLocation } from '../../../components/navigation/common/location-context-helper'

const styles = theme => ({
  icon: {
    transform: 'translate(0px,8px)',
    color: juralioColours.darkText.secondary,
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
  },
  loaderWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
})

const TemplateOverviewContainer = props => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const history = useNavigate()

  const isEditingName = useSelector(
    state => state.template.editingState.isEditingName
  )
  const templateOverview = useSelector(state => state.template.template)

  const isOverviewLoaded = useSelector(
    state => state.template.overview.isLoaded
  )
  const isOverviewLoading = useSelector(
    state => state.template.overview.isLoading
  )
  const isTemplateLoaded = useSelector(state => state.template.isLoaded)
  const areTasksLoaded = useSelector(state => state.template.areTasksLoaded)
  const isOverviewDataReady =
    isTemplateLoaded && isOverviewLoaded && areTasksLoaded
  const referenceNumber = useSelector(
    state => state.template.template.referenceNumber
  )

  const isSystemTemplate = useSelector(
    state => state.template.template.isSystemTemplate
  )

  const userRole = useUserRole()
  const isViewOnly = useIsViewOnly({ activities: [] })

  const templateItemCounts = {
    taskCount: templateOverview.taskCount,
    postCount: templateOverview.postCount,
    resourceCount: templateOverview.resources?.length,
  }

  useEffect(() => {
    const templateId = getTemplateIdFromLocation(props.router.location)
    if (!isOverviewLoaded && !isOverviewLoading) {
      dispatch(fetchTemplate(templateId))
      dispatch(fetchTemplateOverviewWithPosts(templateId))
      dispatch(fetchTemplateTasks(templateId))
    }
  }, [
    dispatch,
    isOverviewLoaded,
    isOverviewLoading,
    props.router.location,
    referenceNumber,
  ])

  const postList = useSelector(state => state.templateTaskPostList.postList)
  useEffect(() => {
    const templateId = getTemplateIdFromLocation(props.router.location)
    dispatch(fetchTemplateOverviewWithPosts(templateId))
  }, [dispatch, postList, props.router.location])

  useEffect(() => {
    return () => {
      dispatch(resetOverview())
      dispatch(reset())
    }
  }, [dispatch])

  const updateTemplateHandler = properties => {
    return dispatch(
      updateTemplate(
        getTemplateIdFromLocation(props.router.location),
        properties
      )
    )
  }

  const clearErrorMessage = () => {
    dispatch(resetTemplateErrorMessage())
  }

  const _showCopyTemplateDialog = () => dispatch(showCopyTemplateDialog())
  const _showDeleteTemplateDialog = () => dispatch(showDeleteTemplateDialog())

  const _deleteTemplate = () => {
    dispatch(deleteTemplate(getTemplateIdFromLocation(props.router.location)))
    dispatch(showDeleteTemplateDialog())
    setTimeout(() => history('/templates'), 1500)
  }
  if (props.userDetails.isExternal) {
    return <Navigate push to="/404" />
  }
  return (
    <>
      {!getDetailsAttribute([
        'firstTimeUserExperience',
        'hasSeenTemplateOverview',
      ]) && (
        <TemplateFtue
          onClose={() => {}}
          ftueContext={'hasSeenTemplateOverview'}
        />
      )}

      {!isOverviewDataReady && (
        <div className={props.classes.loaderWrapper}>
          <BigDataSpinner size={80} />
        </div>
      )}

      {isOverviewDataReady && (
        <ProjectOverview
          backButton={
            <BackToListLink
              linkText={t('templateOverview.goToTemplates')}
              actionHandler={() => history('/templates')}
            />
          }
          loading={!isTemplateLoaded}
          isReadOnly={
            !userRole.isKnowledgeManager || isSystemTemplate || isViewOnly
          }
          clearErrorMessages={clearErrorMessage}
          descriptionPlaceholder={t('templateOverview.descriptionPlaceholder')}
          errorMessage={templateOverview.errorMessage}
          itemCounts={templateItemCounts}
          project={templateOverview}
          updateProject={updateTemplateHandler}
          zeroStateText={t('templateOverview.templateZeroStateText')}
          isTemplate={true}
          projects={[templateOverview.name]}
          editing={{
            isEditingName,
            saveName: name =>
              dispatch(
                updateTemplate(
                  getTemplateIdFromLocation(props.router.location),
                  {
                    name,
                  }
                )
              ),
            clearEditing: () => dispatch(editingActions.clearEditing()),
          }}
          showCopyDialog={props.showCopyDialog}
          showDeleteDialog={props.showDeleteDialog}
          showExportDialog={props.showExportDialog}
          setShowCopyDialog={_showCopyTemplateDialog}
          setShowDeleteDialog={_showDeleteTemplateDialog}
          deleteTemplate={_deleteTemplate}
          removeImage={e => {
            dispatch(
              displayConfirmationDialog(
                {
                  actionText: t('common.confirm'),
                  titleText: t('templates.unsplash.deleteTitle'),
                  promptText: t('templates.unsplash.deletePrompt'),
                  headerIcon: HideImageIcon,
                },
                () => {
                  templateService.updateTemplate(
                    getTemplateIdFromLocation(props.router.location),
                    {
                      url: null,
                      urlCredit: null,
                      urlCreditName: null,
                    }
                  )
                  props.actions.updateTemplateImage(null, null, null)
                }
              )
            )
          }}
        />
      )}
    </>
  )
}

const mapStateToProps = state => ({
  showCopyDialog: state.template.showCopyDialog,
  showDeleteDialog: state.template.showDeleteDialog,
  userDetails: state.auth.data.details,
})
const mapDispatchToProps = dispatch => ({
  actions: {
    updateTemplateImage: bindActionCreators(
      updateTemplateImageNoFetch,
      dispatch
    ),
  },
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(TemplateOverviewContainer, styles))
)
