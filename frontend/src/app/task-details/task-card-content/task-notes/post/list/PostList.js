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

import { List } from '@mui/material'
import Slide from '@mui/material/Slide'
import PropTypes from 'prop-types'
import React from 'react'
import { withTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'
import zeroStateImage from '../../../../../../assets/images/posts.svg'
import WithLoader from '../../../../../../components/feedback/with-loader/WithLoader'
import AddButton from '../../../../../../components/inputs/add-button/AddButton'
import withRouter from '../../../../../../services/navigation/WithRouter'
import PostsZeroState from '../../zero-state/PostsZeroState'
import NewPostMenu from './NewPostMenu'
import PostListItem from './PostListItem'
import PostTitle from './PostTitle'

const styles = () => ({
  postList: {
    display: 'flex',
    flex: '1 1 auto',
    flexDirection: 'column',
    overflowY: 'auto',
    height: 'calc(70% - 48px)',
    alignItems: 'center',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBtn: {
    marginLeft: 'auto',
    paddingRight: '16px',
  },
})

/** Content list display - for Task content*/
class PostList extends React.Component {
  handleTransitionEntered = () => {
    this.props.actions.resetNewCreated()
    if (this.props.templateId) {
      this.props.actions.selectItem(
        this.props.history,
        this.props.templateId,
        this.props.taskId,
        this.props.posts[0].id
      )
    } else {
      this.props.actions.selectItem(
        this.props.history,
        this.props.matterId,
        this.props.projectId,
        this.props.taskId,
        this.props.posts[0].id
      )
    }
  }

  state = {
    anchorEl: null,
  }

  isItemSelected = itemId =>
    parseInt(this.props.selectedItemId) === parseInt(itemId)

  handleAddButtonClick = event => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleMenu = () => {
    this.setState({ anchorEl: null })
  }

  renderListItemInner = (item, index) => (
    <PostListItem
      key={item.id}
      post={item}
      selected={this.isItemSelected(item.id)}
      clickHandler={event => this.props.clickHandler(event, index, item)}
      index={index}
      count={this.props.posts.length}
      isTemplate={this.props.templateId !== undefined}
    />
  )

  renderListItem = (item, index) => {
    if (this.props.newCreated && item.id === this.props.newCreated.id) {
      return (
        <Slide
          direction="down"
          key={item.id}
          in={true}
          onEntered={this.handleTransitionEntered}
        >
          {this.renderListItemInner(item, index)}
        </Slide>
      )
    }

    return this.renderListItemInner(item, index)
  }

  renderTitle = () =>
    this.props.isMobileView ? null : (
      <div className={this.props.classes.header}>
        <PostTitle
          isTemplate={this.props.isTemplate}
          isMilestone={this.props.isMilestone}
          isDeliverable={this.props.isDeliverable}
        />
        {this.props.isEditor &&
          !this.props.isReadOnly &&
          !this.props.viewOnly && (
            <>
              <div className={this.props.classes.addBtn}>
                <AddButton
                  text={this.props.t('postsList.createAPost')}
                  onClick={this.handleAddButtonClick}
                  data-test="create-post-button-post-title"
                  width={120}
                />
              </div>
              <NewPostMenu
                menuItemClickCallback={this.handleMenu}
                anchorEl={this.state.anchorEl}
                origin="center"
                isTemplate={this.props.isTemplate}
                isPostListHeaderBtn={true}
                taskId={this.props.taskId}
              />
            </>
          )}
      </div>
    )

  render() {
    return this.props.posts && this.props.posts.length > 0 ? (
      <div
        id="list-container"
        style={{ height: 'calc(100% - 48px)', overflow: 'auto' }}
      >
        <List
          disablePadding={true}
          className={this.props.classes.postList}
          style={{
            height: this.props.inEditView ? 'calc(70% - 48px)' : '100%',
          }}
        >
          {this.props.posts.map((item, index) =>
            this.renderListItem(item, index)
          )}
        </List>
      </div>
    ) : (
      <PostsZeroState
        image={zeroStateImage}
        title={
          this.props.isReadOnly
            ? this.props.t('postList.zeroStateTitleReadOnly')
            : this.props.t('postList.zeroStateTitle')
        }
        caption={this.props.t('postList.zeroStateCaption')}
        isTemplate={this.props.isTemplate}
        isReadOnly={this.props.isReadOnly || this.props.viewOnly}
        isSmallScreen={this.props.isSmallScreen}
        isSmallPanel={this.props.isSmallPanel}
      />
    )
  }
}

PostList.propTypes = {
  /** newCreated */
  newCreated: PropTypes.object,
  /** Task array of notes object */
  posts: PropTypes.array.isRequired,
  /** Click handler for ListItem */
  clickHandler: PropTypes.func.isRequired,
  /** Flag for control being in read only mode */
  isReadOnly: PropTypes.bool,
  /** falg for different colum layout */
  isSmallScreen: PropTypes.bool,
}

export default withRouter(
  withTranslation()(WithLoader(200)(withStyles(PostList, styles)))
)
