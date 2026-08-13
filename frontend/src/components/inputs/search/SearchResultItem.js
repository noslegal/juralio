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

import { useTheme } from '@emotion/react'
import ListItemButton from '@mui/material/ListItemButton'
import PropTypes from 'prop-types'
import React from 'react'

function SearchResultItem(props) {
  const theme = useTheme()
  const getSelectedStyling = () =>
    props.selected ? { background: theme?.palette.action.selected } : null

  return (
    <ListItemButton
      style={getSelectedStyling()}
      data-test="search-result-list-item"
      onMouseUp={e => {
        props.onClick(e)
      }}
      disabled={
        props.disabledItemFilter ? props.disabledItemFilter(props.item) : false
      }
    >
      {props.renderItemContent(props.item, props.index)}
    </ListItemButton>
  )
}

SearchResultItem.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  disabledItemFilter: PropTypes.func,
  onClick: PropTypes.func.isRequired,
  renderItemContent: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
}

export default SearchResultItem
