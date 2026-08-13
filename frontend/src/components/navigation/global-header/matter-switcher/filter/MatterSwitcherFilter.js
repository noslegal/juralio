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

import SearchIcon from '@mui/icons-material/Search'
import { InputAdornment, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import useDebounce from '../../../../../hooks/debounce-hook'
import juralioColours from '../../../../../theme/juralio-colours'

const style = makeStyles()(theme => ({
  container: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    display: 'flex',
    borderRadius: theme.spacing(0.5),
    backgroundColor: 'white',
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    height: '48px',
  },
  searchField: {
    width: '100%',
  },
  icon: {
    fill: juralioColours.darkText.secondary,
  },
  searchingIcon: {
    animationName: 'wiggle',
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  },
}))

const MatterSwitcherFilter = props => {
  const { classes } = style()
  const { t } = useTranslation()
  const [isSearching, setIsSearching] = useState(false)
  const [searchString, setSearchString] = useState('')
  const debounceValue = useDebounce(searchString, 500)

  useEffect(() => {
    props.setIsSearching(isSearching)
  }, [isSearching]) //eslint-disable-line

  const getListOfFilteredMatterIds = (matters, searchValue) => {
    if (!searchValue || searchValue.length === 0) {
      return matters.map(matter => matter.id)
    }
    const sanitisedSearchValue = searchValue?.toLowerCase()
    return matters
      .filter(matter => {
        //client name
        if (matter.clientName?.toLowerCase().includes(sanitisedSearchValue)) {
          return true
        }
        //matter name
        if (matter.name?.toLowerCase().includes(sanitisedSearchValue)) {
          return true
        }

        //user defined reference number
        if (
          matter.userDefinedReferenceNumber
            ?.toLowerCase()
            .includes(sanitisedSearchValue)
        ) {
          return true
        }
        //workstream names
        const isWorkstreamName =
          matter.projects?.filter(workstream =>
            workstream.name?.toLowerCase().includes(sanitisedSearchValue)
          ).length > 0
        if (isWorkstreamName) {
          return true
        }

        //team member
        const isTeamMember =
          matter.teamMembers.filter(
            teamMember =>
              teamMember.firstname
                ?.toLowerCase()
                .includes(sanitisedSearchValue) ||
              teamMember.lastname
                ?.toLowerCase()
                .includes(sanitisedSearchValue) ||
              teamMember.email?.toLowerCase().includes(sanitisedSearchValue)
          ).length > 0
        if (isTeamMember) {
          return true
        }
        return false
      })
      .map(matter => matter.id)
      .filter(m => m != null)
  }

  useEffect(() => {
    if (!debounceValue) {
      props.setFilter(null)
      setIsSearching(false)
      return
    }
    const filteredMatters = getListOfFilteredMatterIds(
      props.matters,
      debounceValue
    )
    props.setFilter(filteredMatters)
    setIsSearching(false)
  }, [debounceValue]) //eslint-disable-line

  const performSearch = searchValue => {
    if (searchValue === '') {
      props.setFilter(null)
      setSearchString(searchValue)
    } else {
      setIsSearching(true)
      setSearchString(searchValue)
    }
  }

  const handleChange = e => {
    performSearch(e.target.value)
  }

  return (
    <div className={classes.container} data-test="matter-switcher-filter">
      <TextField
        className={classes.searchField}
        data-test="matter-switcher-filter-input"
        label={t('projectSelector.search')}
        onChange={handleChange}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon
                  className={`${classes.icon} ${
                    isSearching && classes.searchingIcon
                  }`}
                />
              </InputAdornment>
            ),
          },
        }}
      />
    </div>
  )
}

export default MatterSwitcherFilter
