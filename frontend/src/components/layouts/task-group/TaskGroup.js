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

import Typography from '@mui/material/Typography'
import PropTypes from 'prop-types'
import React from 'react'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import { withStyles } from 'tss-react/mui'
import withRouter from '../../../services/navigation/WithRouter'
import { templateTaskDetailsRedirectPath } from '../../../services/redirect/TemplateTaskDetailsRedirect'
import TaskCell from '../../data-display/task-cell/TaskCell'
import { getTaskDetailsUrl } from '../../navigation/common/location-context-helper'
import { PortalDraggableWraper } from './PortalDraggableWraper'

const styles = theme => ({
  item: {
    marginBottom: theme.spacing(1),
    height: theme.spacing(5),
    minHeight: theme.spacing(5),
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(0.5),
  },
})

class TaskGroup extends React.Component {
  state = {
    items: [],
  }

  constructor(props) {
    super(props)
    this.state.items = props.items
  }

  componentDidMount = () => {
    this.setState({ items: this.props.items })
  }

  componentDidUpdate = prevProps => {
    if (prevProps.items !== this.props.items) {
      this.setState({ items: this.props.items })
    }
  }

  render = () => {
    const items = this.state.items

    return items && items.length > 0 ? (
      <div className="task-group" data-test={this.props['data-test']}>
        <div className={this.props.classes.titleContainer}>
          <Typography variant="body2" data-test="status-header">
            {this.props.title}
          </Typography>
        </div>
        <Droppable droppableId={`${this.props.droppableId}`}>
          {provided => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {this.renderItems(items)}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    ) : null
  }

  handleClick = item => {
    const newPath = this.props.matterId
      ? getTaskDetailsUrl(this.props.matterId, this.props.projectId, item.id)
      : templateTaskDetailsRedirectPath(this.props.templateId, item.id)

    this.props.router.navigate(newPath)
  }

  renderItems = items => {
    if (items) {
      return items?.map((item, index) => (
        <Draggable
          key={item.id}
          draggableId={`${item.id}`}
          index={index}
          isDragDisabled={this.props.isReadOnly}
        >
          {(provided, snapshot) => (
            <PortalDraggableWraper provided={provided} snapshot={snapshot}>
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={this.props.classes.item}
              >
                <TaskCell
                  matterId={this.props.matterId}
                  clickHandler={() => this.handleClick(item)}
                  item={item}
                  interactive={true}
                  isAboveHeightThreshold={true}
                  handleOptionsClick={this.props.handleOptionsClick}
                  renderDates={false}
                  isReadOnly={this.props.isReadOnly}
                  viewOnly={this.props.isReadOnly}
                  compactHeight={true}
                  selectedTask={null}
                  showOptions={this.props.isReadOnly ? false : true}
                  hideHover={false}
                  disableBackgroundColor={false}
                  displayContent={true}
                  handleDateClick={() => {}}
                />
              </div>
            </PortalDraggableWraper>
          )}
        </Draggable>
      ))
    }

    return <div />
  }
}

TaskGroup.propTypes = {
  /** List of items for the group */
  items: PropTypes.array,
  /** Group title */
  title: PropTypes.string,
  /** matterId */
  matterId: PropTypes.string,
  /** projectId */
  projectId: PropTypes.number,
  /** templateId */
  templateId: PropTypes.string,
}

export default withRouter(withRouter(withStyles(TaskGroup, styles)))
