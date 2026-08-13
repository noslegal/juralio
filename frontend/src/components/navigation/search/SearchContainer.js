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

import React, { useState, useEffect } from 'react'
import Search from './Search'
import { ClickAwayListener } from '@mui/material'
import { performSearch } from '../../../services/helpers/search-service'
import ResultsContainer from './results/ResultsContainer'
import {
  getTemplateIdFromLocation,
  isInMatter,
  isInTemplate,
  isInTemplateGallery,
} from '../common/location-context-helper'
import { useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import SearchIcon from '@mui/icons-material/Search'

import { getMatterIdFromLocation } from '../common/location-context-helper'
import useDebounce from '../../../hooks/debounce-hook'
import rawColours from '../../../theme/raw-colours'
import colorModifiers from '../../../theme/color-modifiers'
const SearchContainer = props => {
  const [showSearch, setShowSearch] = useState(false)
  const [results, setResults] = useState([])
  const [searchAnchor, setSearchAnchor] = useState(null)
  const [focused, setFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const location = useLocation()
  const [input, setInput] = useState('')
  const { t } = useTranslation()
  const getContext = () => {
    const isTemplate = isInTemplate(window.location.href)
    const isInTempGallery = isInTemplateGallery(window.location.href)
    const isMatter = isInMatter(window.location.href)
    if (isTemplate) {
      return {
        contextType: 'template',
        context: parseInt(getTemplateIdFromLocation(window.location)),
        includeMatters: false,
        includeWorkstreams: false,
        includeTemplates: false,
        includeTasks: false,
        includePosts: false,
      }
    } else if (isMatter) {
      return {
        contextType: 'matter',
        context: parseInt(getMatterIdFromLocation(location)),
        includeMatters: false,
        includeTemplates: false,
        includeTemplateTasks: false,
        includeTemplateTaskPosts: false,
      }
    } else if (isInTempGallery) {
      return {
        contextType: 'template',
        context: 0,
        includeMatters: false,
        includeWorkstreams: false,
        includeTemplates: false,
        includeTasks: false,
        includePosts: false,
      }
    }
    return {}
  }

  const [context, setContext] = useState(getContext())

  const getSearchPlaceholder = () => {
    const isTemplate = isInTemplate(window.location.href)
    const isMatter = isInMatter(window.location.href)
    if (isTemplate) {
      return t('globalSearch.searchThisTemplate')
    }
    if (isMatter) {
      return t('globalSearch.searchThisMatter')
    }
    return undefined
  }

  useEffect(() => {
    setContext(getContext())
  }, [location.pathname]) //eslint-disable-line

  const doSearch = (value = input, ignoreContext = false) => {
    if (value && value.length) {
      performSearch(value, ignoreContext ? {} : context).then(res => {
        if (res.status === 200) {
          setResults(res.body)
          setLoading(false)
          setHasLoadedOnce(true)
        }
      })
    }
  }
  const debounceValue = useDebounce(input)

  useEffect(() => {
    if (debounceValue && debounceValue.length) {
      doSearch(debounceValue)
    }
  }, [debounceValue]) //eslint-disable-line

  const onInputChange = e => {
    if (e.target.value === '') {
      setLoading(false)
    } else {
      setLoading(true)
    }
    if (!searchAnchor) {
      setSearchAnchor(e.target)
    }
    setInput(e.target.value)
  }

  const onClickAway = () => {
    setContext(getContext())
    setResults([])
    setInput('')
    setHasLoadedOnce(false)
    setFocused(false)
    props.setFocus(false)
    setLoading(false)
    setShowSearch(false)
    props.setIsSearchToggled(false)
  }

  const onFocus = () => {
    setFocused(true)
    props.setFocus(true)
  }
  if (!showSearch) {
    return (
      <div
        style={{ marginLeft: 'auto' }}
        onMouseEnter={() => props.setShowHover(4)}
        onMouseLeave={() => props.setShowHover(0)}
      >
        <SearchIcon
          data-test="search-icon"
          style={
            props.showHover === 4
              ? {
                  marginTop: '5px',
                  marginLeft: 'auto',
                  marginRight: '16px',
                  cursor: 'pointer',
                  color: rawColours.status.notRequired.dark,
                }
              : {
                  marginTop: '5px',
                  marginLeft: 'auto',
                  marginRight: '16px',
                  cursor: 'pointer',
                  color: colorModifiers.primaryBackground(
                    rawColours.status.notRequired.dark
                  ),
                }
          }
          onClick={() => {
            setShowSearch(true)
            setFocused(true)
            props.setFocus(true)
            props.setIsSearchToggled(true)
          }}
        />
      </div>
    )
  } else {
    return (
      <ClickAwayListener onClickAway={onClickAway}>
        <div
          style={{
            flexGrow: 1,
            display: 'flex',
            transition: 'all .2s ease',
          }}
        >
          <Search
            results={results}
            onInputChange={onInputChange}
            setSearchAnchor={setSearchAnchor}
            onFocus={onFocus}
            focused={focused}
            searchPlaceholder={getSearchPlaceholder()}
            globalSearchClasses={true}
            onBlur={() => {}}
            showNoResults={true}
          />
          {focused && (
            <ResultsContainer
              anchor={searchAnchor}
              results={results}
              query={input}
              onClose={() => {
                onClickAway()
              }}
              noResults={hasLoadedOnce && results.length === 0}
              loading={loading}
              context={context}
              searchContext={() => {
                setContext(getContext())
                setLoading(true)
                doSearch(input, false)
              }}
              searchEverywhere={() => {
                setLoading(true)
                doSearch(input, true)
              }}
            />
          )}
        </div>
      </ClickAwayListener>
    )
  }
}

export default SearchContainer
