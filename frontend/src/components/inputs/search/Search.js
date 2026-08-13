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

import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import { InputAdornment } from '@mui/material'
import TextField from '@mui/material/TextField'
import Downshift from 'downshift'
import PropTypes from 'prop-types'
import React from 'react'
import { withStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import SearchResultsListContainer from './SearchResultsListContainer'

const styles = theme => ({
  searchField: {
    width: '100%',
  },
  downArrow: {
    cursor: 'pointer',
  },
  searchContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentContainer: {
    flexGrow: 1,
  },
  innerTextField: {
    height: '38px',
    paddingLeft: theme.spacing(),
  },
  globalSearchIcon: {
    paddingLeft: theme.spacing(),
    paddingTop: theme.spacing(),
    paddingBottom: theme.spacing(),
    height: theme.spacing(3),
    color: juralioColours.named.grey[300],
    width: theme.spacing(3),
  },
  searchIcon: {
    marginTop: theme.spacing(1),
    color: juralioColours.project.name,
  },
})

class Search extends React.Component {
  focus() {
    this.autoFocusTimer = setTimeout(() => {
      if (this.anchorEl) {
        this.anchorEl.focus()
      }
    }, 200)
  }

  componentDidMount() {
    if (this.props.focus) {
      this.focus()
    }
  }

  componentDidUpdate() {
    if (this.props.focus) {
      this.focus()
    }
  }

  componentWillUnmount() {
    clearTimeout(this.autoFocusTimer)
  }

  renderItems(
    inputValue,
    getItemProps,
    selectedItem,
    highlightedIndex,
    getMenuProps
  ) {
    return (
      <SearchResultsListContainer
        inputValue={inputValue}
        getItemProps={getItemProps}
        selectedItem={selectedItem}
        highlightedIndex={highlightedIndex}
        performSearch={this.props.performSearch}
        renderItemContent={this.props.renderItemContent}
        disabledItemFilter={this.props.disabledItemFilter}
        resultsToExclude={this.props.resultsToExclude}
        exclusionComparator={this.props.exclusionComparator}
        anchorEl={this.anchorEl}
        getMenuProps={getMenuProps}
        filterAlwaysHidden={this.props.filterHidden}
        usageContext={this.props.usageContext}
        flatResultsList={this.props.flatResultsList}
        menuStyle={this.props.menuStyle}
        showNoResults={this.props.showNoResults}
        renderCustomNoResults={this.props.renderCustomNoResults}
      />
    )
  }

  renderCloseAdornment = () => (
    <CloseIcon data-test="close-icon" onClick={() => this.props.close()} />
  )

  setAnchorElement = element => {
    this.anchorEl = element
  }

  onClose = o => {
    if (o.isOpen === false) {
      if (this.props.onClose) {
        this.props.onClose()
      }
    }
  }

  render() {
    return (
      <div className={this.props.classes.searchContainer}>
        {this.props.usageContext === 'GlobalSearch' && (
          <SearchIcon className={this.props.classes.globalSearchIcon} />
        )}
        <Downshift
          onChange={this.props.onChange}
          onStateChange={this.onClose}
          itemToString={this.props.formatSelectedItem}
          selectedItem={this.props.selectedItem}
        >
          {({
            getInputProps,
            getItemProps,
            getMenuProps,

            isOpen,
            inputValue,
            highlightedIndex,
            selectedItem,
            toggleMenu,
          }) => (
            <div className={this.props.classes.contentContainer}>
              <TextField
                error={this.props.error}
                helperText={this.props.helperText}
                data-test="auto-complete-search-term"
                variant={this.props.variant}
                placeholder={this.props.placeholder}
                className={this.props.classes.searchField}
                inputRef={this.setAnchorElement}
                disabled={this.props.disabled}
                slotProps={{
                  input: {
                    disableUnderline: this.props.globalSearch ? true : false,
                    classes: {
                      root: this.props.classes.innerTextField,
                    },
                    onFocus: () => {
                      this.props.onFocus()
                      this.props.showDropDownArrow && toggleMenu()
                    },

                    ...getInputProps(),
                    onBlur: () => {
                      setTimeout(this.props.onBlur, 100)
                    },

                    endAdornment: this.props.mobile ? (
                      this.renderCloseAdornment()
                    ) : (
                      <InputAdornment position="end">
                        {this.props.usageContext !== 'GlobalSearch' && (
                          <SearchIcon
                            className={this.props.classes.searchIcon}
                          />
                        )}
                      </InputAdornment>
                    ),
                  },
                }}
              />
              {isOpen
                ? this.renderItems(
                    inputValue,
                    getItemProps,
                    selectedItem,
                    highlightedIndex,
                    getMenuProps
                  )
                : null}
            </div>
          )}
        </Downshift>
      </div>
    )
  }
}

Search.propTypes = {
  autoFocus: PropTypes.bool,
  disabled: PropTypes.bool,
  disabledItemFilter: PropTypes.func,
  error: PropTypes.bool,
  exclusionComparator: PropTypes.func,
  flatResultsList: PropTypes.bool,
  formatSelectedItem: PropTypes.func.isRequired,
  helperText: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  performSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  renderItemContent: PropTypes.func,
  resultsToExclude: PropTypes.array,
  selectedItem: PropTypes.any,
  showDropDownArrow: PropTypes.bool,
  variant: PropTypes.string,
  menuStyle: PropTypes.object,
}

export default withStyles(Search, styles)
