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
import { withStyles } from 'tss-react/mui'
import matterService from '../../../services/matter/matter-service'
import Search from '../search/Search'

const styles = theme => ({
  root: {
    width: '100%',
  },
  selectText: { color: theme.palette.text.secondary },
  itemContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  matterName: {
    maxWidth: 350,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
})

class MatterSelect extends React.Component {
  state = { matters: [] }

  componentDidMount() {
    matterService.getMatters(true).then(response => {
      this.setState({ matters: response.body })
    })
  }

  renderItemComponent = item => {
    return (
      <div
        data-test="matter-select-menu-item"
        className={this.props.classes.itemContainer}
      >
        <Typography
          data-test="matter-name"
          className={this.props.classes.matterName}
          variant="body1"
        >
          {item.name}
        </Typography>
        <Typography data-test="matter-id" variant="body1">
          {item.matterId}
        </Typography>
      </div>
    )
  }

  getMatterFromId() {
    if (this.props.matterId && this.state.matters.length > 0) {
      return this.state.matters.find(matter => {
        return matter.id === this.props.matterId
      })
    }
    return ''
  }

  focusOnMatters = () =>
    this.state.matters.length > 0 && this.props.focus ? true : false

  performSearch = searchTerm => {
    const items = this.state.matters || []

    return Promise.resolve(
      items.filter(
        item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          item.activeWorkstreams > 0
      )
    )
  }

  renderSelectedItem = item => (item ? `${item.name} - ${item.matterId}` : '')

  hasError = () => {
    if (!this.props.errorMessage) return false
    return this.props.errorMessage.length > 0
  }

  render() {
    if (!this.state.matters) return null
    return (
      <div data-test="matter-select-container">
        <Search
          selectedItem={this.getMatterFromId()}
          onChange={this.props.onChange}
          performSearch={this.performSearch}
          placeholder="Choose a matter"
          renderItemContent={this.renderItemComponent}
          formatSelectedItem={this.renderSelectedItem}
          showDropDownArrow
          focus={this.focusOnMatters()}
          filterHidden={true}
          error={this.hasError()}
          helperText={this.props.errorMessage}
          usageContext="MatterSelect"
          onFocus={() => {}}
          onBlur={() => {}}
          showNoResults={true}
        />
      </div>
    )
  }
}

MatterSelect.propTypes = {
  /** Id of the Task's Matter */
  matterId: PropTypes.number,
  /** Flag to set focus on Matter Select*/
  focus: PropTypes.bool,
  /** Handler for selection change*/
  onChange: PropTypes.func.isRequired,
  /** Error message text*/
  errorMessage: PropTypes.string,
}

export default withStyles(MatterSelect, styles)
