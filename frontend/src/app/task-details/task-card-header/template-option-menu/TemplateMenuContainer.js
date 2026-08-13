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

import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { useLocation } from 'react-router'
import { bindActionCreators } from 'redux'
import {
  getTaskIdFromLocation,
  getTemplateIdFromLocation,
  isInTemplateTaskDetails,
} from '../../../../components/navigation/common/location-context-helper'

import { startEditingTaskName } from '../../../task-map/selected-task/selected-task-actions'
import {
  fetchTemplateTask,
  updateTemplateTaskDetails,
} from '../../../template-task-details/template-task-actions'
import {
  fetchTemplateOverview,
  fetchTemplateTasks,
} from '../../../template/template-actions'
import TemplateMenu from './TemplateMenu'

const TemplateMenuContainer = props => {
  const handleRenameClick = () => {
    props.actions.startEditingTaskName()
    props.closeHandler()
  }
  const location = useLocation()

  const milestoneConversion = () => {
    const isMilestone = props.task.isMilestone
    const templateId = getTemplateIdFromLocation(location)
    return props.actions
      .updateTaskDetails(templateId, props.task.id, {
        isMilestone: !isMilestone,
      })
      .then(() => {
        if (isInTemplateTaskDetails(location.pathname)) {
          props.actions.fetchTemplateTask(
            templateId,
            getTaskIdFromLocation(location)
          )
        } else {
          props.actions.fetchTemplateTasks(templateId)
        }
        props.closeHandler()
      })
  }

  const deliverableConversion = () => {
    const isDeliverable = props.task.isDeliverable
    const templateId = getTemplateIdFromLocation(location)
    return props.actions
      .updateTaskDetails(templateId, props.task.id, {
        isDeliverable: !isDeliverable,
      })
      .then(() => {
        if (isInTemplateTaskDetails(location.pathname)) {
          props.actions.fetchTemplateTask(
            templateId,
            getTaskIdFromLocation(location)
          )
        } else {
          props.actions.fetchTemplateTasks(templateId)
        }
        props.closeHandler()
      })
  }

  return (
    <TemplateMenu
      {...props}
      handleRenameClick={
        props.handleRenameClick ? props.handleRenameClick : handleRenameClick
      }
      handleMilestoneConversion={milestoneConversion}
      handleDeliverableConversion={deliverableConversion}
    />
  )
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      startEditingTaskName: bindActionCreators(startEditingTaskName, dispatch),
      updateTaskDetails: bindActionCreators(
        updateTemplateTaskDetails,
        dispatch
      ),
      fetchTemplateOverview: bindActionCreators(
        fetchTemplateOverview,
        dispatch
      ),
      fetchTemplateTask: bindActionCreators(fetchTemplateTask, dispatch),
      fetchTemplateTasks: bindActionCreators(fetchTemplateTasks, dispatch),
    },
  }
}

function mapStateToProps(state) {
  return {
    taskDeleted: state.selectedTemplateTask.isDeleted,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TemplateMenuContainer)

TemplateMenu.propTypes = {
  task: PropTypes.object.isRequired,
  closeHandler: PropTypes.func.isRequired,
  anchor: PropTypes.object,
  /** Rename click handler */
  handleRenameClick: PropTypes.func.isRequired,
}
