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

import MoveIcon from '@mui/icons-material/CallMade'
import DeleteIcon from '@mui/icons-material/Delete'
import Menu from '@mui/material/Menu'
import PropTypes from 'prop-types'
import React from 'react'
import { withTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import OperationMenuItem from '../../../../app/task-details/task-card-header/task-option-menu/OperationMenuItem'
import JurMilestone from '../../../../assets/images/JurMilestone'
import {
  getTemplateIdFromLocation,
  getTemplateTaskMapUrl,
} from '../../../../components/navigation/common/location-context-helper'
import withRouter from '../../../../services/navigation/WithRouter'
import { CopyIcon, EditIcon } from '../../../../theme/navigation/CommonIcons'
import CopyTemplateTaskContainer from '../../../template/template-options/template-copy/CopyTemplateTaskContainer'
import DeleteTemplateTaskContainer from '../../../template/template-options/template-delete/DeleteTemplateTaskContainer'
import MoveTemplateTaskContainer from '../../../template/template-options/template-move/MoveTemplateTaskContainer'
import JurDeliverable from '../../../../assets/images/JurDeliverable'

const DIALOG_NAMES = {
  DELETE: 'DELETE',
  COPY: 'COPY',
  MOVE: 'MOVE',
}

class TemplateMenu extends React.Component {
  state = {
    COPY: false,
    DELETE: false,
    MOVE: false,
    redirect: false,
    path: '',
  }

  componentDidUpdate(prevProps) {
    const templateId = getTemplateIdFromLocation(this.props.router.location)
    if (!prevProps.taskDeleted && this.props.taskDeleted) {
      this.setState({
        path: this.props.task.parent
          ? getTemplateTaskMapUrl(templateId, this.props.task.parent.id)
          : getTemplateTaskMapUrl(templateId),
        redirect: true,
      })
    }
  }

  isMenuOpen = () =>
    Boolean(this.props.anchor) &&
    !this.state.DELETE &&
    !this.state.COPY &&
    !this.state.MOVE

  renderMilestoneOption = () => {
    const isMilestone = this.props.task.isMilestone
    if (isMilestone) {
      return (
        <OperationMenuItem
          handleClick={this.props.handleMilestoneConversion}
          icon={JurMilestone}
          operationType={'convertToTask'}
        />
      )
    }
    if (!isMilestone && this.props.task.tasks?.length > 0) {
      return (
        <OperationMenuItem
          handleClick={() => {}}
          icon={JurMilestone}
          operationType={'convertToMilestone'}
          disabled={true}
          tooltipText={this.props.t(
            'operationMenuItem.cantConvertToMilestoneDetails'
          )}
        />
      )
    }
    return (
      <OperationMenuItem
        handleClick={this.props.handleMilestoneConversion}
        icon={JurMilestone}
        operationType={'convertToMilestone'}
      />
    )
  }

  renderDeliverableOption = () => {
    const isDeliverable = this.props.task.isDeliverable
    if (isDeliverable) {
      return (
        <OperationMenuItem
          handleClick={this.props.handleDeliverableConversion}
          icon={JurDeliverable}
          operationType={'convertToTask'}
        />
      )
    }

    return (
      <OperationMenuItem
        handleClick={this.props.handleDeliverableConversion}
        icon={JurDeliverable}
        operationType={'convertToDeliverable'}
      />
    )
  }

  render() {
    if (
      !this.props.task ||
      (this.props.anchor && this.props.anchor.clientHeight === 0)
    )
      return null
    if (!this.state.redirect) {
      return (
        <div>
          <Menu
            disableAutoFocusItem={true}
            anchorEl={this.props.anchor}
            open={this.isMenuOpen()}
            onClose={this.props.closeHandler}
            data-test="template-card-option-menu"
          >
            {!this.props.hideRename && (
              <OperationMenuItem
                handleClick={this.props.handleRenameClick}
                icon={EditIcon}
                operationType={'Rename'}
                task={this.props.task}
              />
            )}
            <OperationMenuItem
              handleClick={this.handleCopyClick}
              icon={CopyIcon}
              operationType={'Copy'}
              task={this.props.task}
            />
            <OperationMenuItem
              handleClick={this.handleMoveClick}
              icon={MoveIcon}
              operationType={'Move'}
              task={this.props.task}
            />
            <OperationMenuItem
              handleClick={this.handleDeleteClick}
              icon={DeleteIcon}
              operationType={'Delete'}
              task={this.props.task}
            />
            {this.props.task.tasks &&
              this.props.task.level > 1 &&
              this.renderMilestoneOption()}
            {this.props.task.tasks &&
              this.props.task.level > 1 &&
              this.renderDeliverableOption()}
          </Menu>

          {this.state[DIALOG_NAMES.DELETE] && (
            <DeleteTemplateTaskContainer
              task={this.props.task}
              display={this.state[DIALOG_NAMES.DELETE]}
              cancelHandler={this.hideDialog(DIALOG_NAMES.DELETE)}
              taskMenuContext={this.props.taskMenuContext}
            />
          )}
          {this.state[DIALOG_NAMES.COPY] && (
            <CopyTemplateTaskContainer
              task={this.props.task}
              display={this.state[DIALOG_NAMES.COPY]}
              cancelHandler={this.hideDialog(DIALOG_NAMES.COPY)}
              taskMenuContext={this.props.taskMenuContext}
              closeHandler={this.props.closeHandler}
              dontRedirect={this.props.dontRedirect}
            />
          )}
          {this.state[DIALOG_NAMES.MOVE] && (
            <MoveTemplateTaskContainer
              task={this.props.task}
              display={this.state[DIALOG_NAMES.MOVE]}
              cancelHandler={this.hideDialog(DIALOG_NAMES.MOVE)}
              taskMenuContext={this.props.taskMenuContext}
              dontRedirect={this.props.dontRedirect}
            />
          )}
        </div>
      )
    }

    return <Navigate to={this.state.path} />
  }

  handleCopyClick = () => this.showDialog(DIALOG_NAMES.COPY)

  handleMoveClick = () => this.showDialog(DIALOG_NAMES.MOVE)

  handleDeleteClick = () => this.showDialog(DIALOG_NAMES.DELETE)

  showDialog = dialogName => this.setState({ [dialogName]: true })

  hideDialog = dialogName => () => {
    this.setState({
      [dialogName]: false,
    })
    this.props.closeHandler()
  }
}

TemplateMenu.propTypes = {
  /** anchor */
  anchor: PropTypes.object,
  /** closeHandler */
  closeHandler: PropTypes.func.isRequired,
  /** handleRenameClick */
  handleRenameClick: PropTypes.func.isRequired,
  /** task */
  task: PropTypes.object.isRequired,
  /** taskDeleted */
  taskDeleted: PropTypes.bool.isRequired,
  /** taskMenuContext */
  taskMenuContext: PropTypes.string.isRequired,
}

export default withTranslation()(withRouter(TemplateMenu))
