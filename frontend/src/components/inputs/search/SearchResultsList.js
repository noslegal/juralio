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
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { getLocationParams } from '../../../services/helpers/route/route-helper'
import NoContent from '../../data-display/no-content/NoContent'
import withLoader from '../../feedback/with-loader/WithLoader'
import SearchFilterOptions from './SearchFilterOptions'
import SearchResultItem from './SearchResultItem'

const noResults = (noResultsText, items, props) => {
  if (items.length === 0) {
    if (props.renderCustomNoResults) {
      return props.renderCustomNoResults()
    }
    return (
      <NoContent variant="subtitle1" data-test="no-results-search">
        {noResultsText}
      </NoContent>
    )
  }
}

const SearchResultsList = withLoader(50)(props => {
  const { t } = useTranslation()
  const { items } = props
  const inContext = getLocationParams('workstream') ? true : false
  return (
    <div
      {...props.getMenuProps({
        style: props.menuStyle,
      })}
    >
      <List data-test="search-results-list">
        {!props.filterHidden && inContext && (
          <SearchFilterOptions
            setFilterHiddenHandler={props.setFilterHiddenHandler}
            onSearchEverything={props.onSearchEverything}
            {...props.getItemProps({
              item: '',
              disabled: true,
            })}
          />
        )}
        {props.showNoResults && noResults(t('search.noResults'), items, props)}
        {items?.map((item, index) => (
          <SearchResultItem
            {...props.getItemProps({
              key: item.id,
              index: index,
              item: item,
            })}
            selected={props.highlightedIndex === index}
            renderItemContent={props.renderItemContent}
            disabledItemFilter={props.disabledItemFilter}
            item={item}
            index={index}
            count={items.length}
            usageContext={props.usageContext}
          />
        ))}
      </List>
    </div>
  )
})

SearchResultsList.propTypes = {
  /** items */
  items: PropTypes.array,
  /** getMenuProps */
  getMenuProps: PropTypes.func,
  /** filterHidden */
  filterHidden: PropTypes.bool,
  /** setFilterHiddenHandler */
  setFilterHiddenHandler: PropTypes.func,
  /** onSearchEverything */
  onSearchEverything: PropTypes.func,
  /** getItemProps */
  getItemProps: PropTypes.func,
  /** highlightedIndex */
  highlightedIndex: PropTypes.number,
  /** renderItemContent */
  renderItemContent: PropTypes.func,
  /** disabledItemFilter */
  disabledItemFilter: PropTypes.func,
  /** usageContext */
  usageContext: PropTypes.string,
  menuStyle: PropTypes.object,
}

export default SearchResultsList
