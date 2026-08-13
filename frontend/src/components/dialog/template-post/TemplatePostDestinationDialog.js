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

import { DialogContent, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'
import { getLocationParams } from '../../../services/helpers/route/route-helper'
import TemplateSelect from '../../inputs/template-select/TemplateSelect'
import TemplateTaskSelect from '../../inputs/template-task-select/TemplateTaskSelect'
import JuralioDialog from '../juralio-dialog/JuralioDialog'

const styles = theme => ({
  root: {
    width: theme.spacing(60),
  },
})

class TemplatePostDestinationDialog extends Component {
  state = { selectedTemplateId: null, selectedTaskId: null }

  componentDidMount = () => {
    const taskLocationParams = getLocationParams('task')
    this.setState({
      selectedTemplateId: getLocationParams('template'),
      selectedTaskId: taskLocationParams,
    })
  }

  focusTask() {
    return (
      this.state.selectedTemplateId !== undefined &&
      this.state.selectedTaskId === undefined
    )
  }

  focusTemplate() {
    return !(this.state.selectedTemplateId === undefined)
  }

  handleTemplateChange = template => {
    this.setState({
      selectedTemplateId: template.id,
      selectedTaskId: undefined,
    })
  }

  handleTemplateTaskChange = templateTask => {
    this.setState({
      selectedTaskId: templateTask.id,
    })
  }

  render() {
    return (
      <JuralioDialog
        data-test="destination-dialog"
        open={true}
        onClose={this.props.cancelHandler}
        fullScreen={this.props.fullScreen}
        titleText={this.props.titleText}
        titleIcon={this.props.titleIcon}
        handleAction={this.onCreateClicked}
        handleCancel={this.props.cancelHandler}
        actionLabel={this.props.t('common.create')}
        disabled={!this.state.selectedTaskId}
        usageContext="TemplateTaskDestinationDialog"
        cancelText={this.props.cancelText}
      >
        <DialogContent>
          <Typography
            variant="body1"
            className={this.props.classes.root}
            data-test="templatise-prompt"
          >
            {this.props.t(
              'templatePostDestinationDialog.whereToCreateTemplatePost'
            )}
          </Typography>
          <TemplateSelect
            key={this.state.selectedTemplateId}
            selectionChangeHandler={this.handleTemplateChange}
            templateId={this.state.selectedTemplateId}
            placeholder={this.props.t(
              'templatePostDestinationDialog.chooseATemplate'
            )}
            focus={this.focusTemplate()}
          />
          {this.renderTaskSelect()}
        </DialogContent>
      </JuralioDialog>
    )
  }

  renderTaskSelect = () => {
    return (
      <TemplateTaskSelect
        selectedTaskId={this.state.selectedTaskId}
        templateId={this.state.selectedTemplateId}
        onChange={this.handleTemplateTaskChange}
        error={false}
        focus={this.focusTask()}
        helperText={''}
      />
    )
  }

  onCreateClicked = () =>
    this.props.createHandler(
      this.state.selectedTemplateId,
      this.state.selectedTaskId
    )
}

TemplatePostDestinationDialog.propTypes = {
  /** cancelHandler */
  cancelHandler: PropTypes.func,
  /** fullScreen */
  fullScreen: PropTypes.bool.isRequired,
  /** titleText */
  titleText: PropTypes.string.isRequired,
  /** titleIcon */
  titleIcon: PropTypes.object.isRequired,
  /** createHandler */
  createHandler: PropTypes.func.isRequired,
}

export default withTranslation()(
  withStyles(TemplatePostDestinationDialog, styles)
)
