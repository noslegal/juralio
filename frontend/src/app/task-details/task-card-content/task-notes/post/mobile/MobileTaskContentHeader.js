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

import ArrowBack from '@mui/icons-material/ArrowBack'
import MoreVert from '@mui/icons-material/MoreVert'
import { Typography } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { withStyles } from 'tss-react/mui'
import juralioColours from '../../../../../../theme/juralio-colours'
import TaskPostOptionMenuContainer from '../menu/TaskPostOptionMenuContainer'
import TemplateTaskPostOptionMenuContainer from '../menu/TemplateTaskPostOptionMenuContainer'

const styles = theme => ({
  taskContentHeader: {
    display: 'flex',
    alignItems: 'center',
    minHeight: theme.spacing(6.5),
    maxHeight: theme.spacing(6.5),
    width: `calc(100% - ${theme.spacing(2)})`,
    paddingLeft: theme.spacing(2),
    overflowY: 'auto',
    overflowX: 'none',
  },
  backIcon: {
    color: juralioColours.darkText.primary,
    backgroundColor: juralioColours.navigation.background,
  },
  taskName: {
    color: juralioColours.darkText.primary,
    backgroundColor: juralioColours.navigation.background,
    width: `calc(100% - ${theme.spacing(11)})`,
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  optionMenu: {
    color: juralioColours.darkText.primary,
    paddingLeft: theme.spacing(1),
  },
})

/** Header for task content when in displayed in mobile view*/
class MobileTaskContentHeader extends Component {
  state = { anchorEl: null }

  openOptionMenu = event => this.setState({ anchorEl: event.currentTarget })

  closeOptionMenu = () => this.setState({ anchorEl: null })

  convertPostHandler = () => {
    this.props.actions.updatePost(
      this.props.project.matterId,
      this.props.project.id,
      this.props.task.id,
      this.props.post.id,
      { type: this.props.post.type === null ? 'Meeting' : null },
      false
    )
    this.closeOptionMenu()
  }

  render() {
    return (
      <div
        className={this.props.classes.taskContentHeader}
        data-test="task-content-header"
      >
        <ArrowBack
          className={this.props.classes.backIcon}
          onClick={this.props.clickBackHandler}
          data-test="task-content-back-header"
        />
        <Typography
          variant="body1"
          className={this.props.classes.taskName}
          data-test="task-name-content-header"
        >
          {this.props.name}
        </Typography>
        {!this.props.viewOnly && (
          <IconButton
            data-test="task-content-header-menu-button"
            onClick={this.openOptionMenu}
            size="large"
          >
            <MoreVert
              color="secondary"
              className={this.props.classes.optionMenu}
            />
          </IconButton>
        )}
        {this.renderMenuContent()}
      </div>
    )
  }

  movePost = () => {
    this.closeOptionMenu()
    this.props.movePost()
  }

  handlePostPrivacy = () => {
    this.props.makeVisible(!this.props.post.privatePost)
  }

  renderMenuContent = () => {
    return this.props.showDraftMenuItems ? (
      <TaskPostOptionMenuContainer
        makeVisible={this.handlePostPrivacy}
        anchor={this.state.anchorEl}
        closeHandler={this.closeOptionMenu}
        convertPostHandler={this.convertPostHandler}
        showDraftMenuItems={true}
        movePost={this.movePost}
        isTemplate={this.props.isTemplate}
      />
    ) : (
      <TemplateTaskPostOptionMenuContainer
        anchor={this.state.anchorEl}
        closeHandler={this.closeOptionMenu}
        movePost={this.movePost}
      />
    )
  }
}

MobileTaskContentHeader.propTypes = {
  /** Name of task */
  name: PropTypes.string.isRequired,
  /** clickBackHandler */
  clickBackHandler: PropTypes.func.isRequired,
  /** showDraftMenuItems */
  showDraftMenuItems: PropTypes.bool.isRequired,
}

export default withStyles(MobileTaskContentHeader, styles)
