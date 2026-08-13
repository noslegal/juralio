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

import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'
import { withStyles } from 'tss-react/mui'
import { filterResults } from '../../../services/helpers/filter-helper'
import { checkTextHasNonWhitespaceContent } from '../../../services/helpers/text/text-util-helper'
import SearchResultsList from './SearchResultsList'

const styles = theme => ({
  root: {
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    zIndex: theme.zIndex.modal,
  },
  paper: {
    overflow: 'auto',
    overflowX: 'hidden',
    maxHeight: 250,
  },
  popper: {
    zIndex: 10000,
  },
})

class SearchResultsListContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      items: [],
      filterHidden: props.filterAlwaysHidden,
    }
    this.anchorEl = ReactDOM.findDOMNode(this.props.anchorEl)
    this.debouncedSearch = this.debounce(this.performSearch, 400)
    this.shouldSearchEverything = false
  }

  debounce(func, wait) {
    return function (...args) {
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => func.apply(this, args), wait)
    }
  }

  performSearch() {
    if (
      this.props.inputValue === '' ||
      checkTextHasNonWhitespaceContent(this.props.inputValue)
    ) {
      this.setState({ loading: true })

      const resolveSearch = this.props.performSearch(
        this.props.inputValue,
        this.shouldSearchEverything
      )

      if (resolveSearch) {
        resolveSearch.then(response => {
          let searchResults = response
          let resultsToExclude = this.props.resultsToExclude

          searchResults = filterResults(
            searchResults,
            resultsToExclude,
            this.props.exclusionComparator
          )
          this.setState({ items: searchResults, loading: false })
        })
      } else {
        this.setState({ items: [], loading: false })
      }
    }
  }

  componentDidMount() {
    this.debouncedSearch()
  }

  componentDidUpdate(previousProps) {
    if (previousProps.inputValue !== this.props.inputValue) {
      this.debouncedSearch()
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout)
  }

  searchEverything = () => {
    this.shouldSearchEverything = true
    this.performSearch()
  }

  setFilterHiddenHandler = () => {
    this.setState({ filterHidden: true })
  }

  render() {
    if (this.props.flatResultsList) {
      return this.renderResultsList()
    }

    return (
      <Popper
        data-test="search-popper"
        className={this.props.classes.popper}
        style={{
          width: this.anchorEl.getBoundingClientRect().width,
        }}
        open={true}
        anchorEl={this.anchorEl}
      >
        <Paper className={this.props.classes.paper} elevation={2}>
          {this.renderResultsList()}
        </Paper>
      </Popper>
    )
  }

  renderResultsList = () => {
    return (
      <SearchResultsList
        filterHidden={this.state.filterHidden}
        setFilterHiddenHandler={this.setFilterHiddenHandler}
        onSearchEverything={this.searchEverything}
        isLoaded={!this.state.loading}
        getMenuProps={this.props.getMenuProps}
        getItemProps={this.props.getItemProps}
        highlightedIndex={this.props.highlightedIndex}
        renderItemContent={this.props.renderItemContent}
        disabledItemFilter={this.props.disabledItemFilter}
        items={this.state.items}
        usageContext={this.props.usageContext}
        menuStyle={this.props.menuStyle}
        showNoResults={this.props.showNoResults}
        renderCustomNoResults={this.props.renderCustomNoResults}
      />
    )
  }
}

SearchResultsListContainer.propTypes = {
  anchorEl: PropTypes.object.isRequired,
  exclusionComparator: PropTypes.func,
  inputValue: PropTypes.string.isRequired,
  performSearch: PropTypes.func.isRequired,
  resultsToExclude: PropTypes.array,
  flatResultsList: PropTypes.bool,
  menuStyle: PropTypes.object,
}

export default withStyles(SearchResultsListContainer, styles)
