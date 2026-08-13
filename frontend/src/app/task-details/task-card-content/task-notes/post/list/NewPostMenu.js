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
import { withStyles } from 'tss-react/mui'
import CreateNoteFlowContainer from '../../../../../../components/flows/create-note-flow/CreateNoteFlowContainer'
import CreateTemplateNoteFlowContainer from '../../../../../../components/flows/create-template-note-flow/CreateTemplateNoteFlowContainer'
import FabActionItem from '../../../../../../components/navigation/fab-button/FabActionItem'
import SubMenu from '../../../../../../components/navigation/fab-button/subMenu/SubMenu'
import {
  NoteIcon,
  WebLinkIcon,
} from '../../../../../../theme/navigation/CommonIcons'

const styles = theme => ({
  menu: {
    display: 'flex',
    alignItems: 'center',
  },
})

class NewPostMenu extends React.Component {
  state = {
    CREATE_NOTE_FLOW: false,
    CREATE_LINK_FLOW: false,
    type: null,
  }

  actions = [
    {
      dataTest: 'create-note',
      icon: NoteIcon,
      nameTextId: 'note',
      onClick: () => {
        this.setState({ CREATE_NOTE_FLOW: true })
        this.props.menuItemClickCallback()
      },
    },
    {
      icon: WebLinkIcon,
      nameTextId: 'link',
      dataTest: 'create-link',
      onClick: () => {
        this.setState({ CREATE_LINK_FLOW: true })
        this.props.menuItemClickCallback()
      },
    },
  ]

  hideDialog = () => {
    this.setState({
      CREATE_NOTE_FLOW: false,
      CREATE_LINK_FLOW: false,
      type: null,
    })
  }

  renderDialog() {
    if (this.state.type !== null) {
      return this.props.isTemplate ? (
        <CreateTemplateNoteFlowContainer
          type={this.state.type}
          cancelHandler={this.hideDialog}
        />
      ) : (
        <CreateNoteFlowContainer
          type={this.state.type}
          cancelHandler={this.hideDialog}
          isPostListHeaderBtn={this.props?.isPostListHeaderBtn}
          taskId={this.props?.taskId}
        />
      )
    }
  }

  openMenu = () => this.props.anchorEl !== null

  renderAction = action => (
    <FabActionItem
      key={`action-${action.nameTextId}`}
      action={action}
      mobile={false}
      contextMenu={true}
    />
  )

  render() {
    return (
      <React.Fragment>
        {this.openMenu() && (
          <SubMenu
            anchor={this.props.anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
            }}
            close={() => {
              this.props.menuItemClickCallback()
            }}
            select={type => this.setState({ type })}
          />
        )}
        {this.renderDialog()}
      </React.Fragment>
    )
  }
}

NewPostMenu.propTypes = {
  /** menuItemClickCallback */
  menuItemClickCallback: PropTypes.func.isRequired,
  /** isTemplate */
  isTemplate: PropTypes.bool,
  /** isPostListHeaderBtn */
  isPostListHeaderBtn: PropTypes.bool,
  /** anchorEl */
  anchorEl: PropTypes.object,
  /** origin */
  origin: PropTypes.string.isRequired,
}

export default withStyles(NewPostMenu, styles)
