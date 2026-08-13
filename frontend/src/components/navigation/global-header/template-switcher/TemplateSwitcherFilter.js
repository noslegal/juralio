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
import { TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import useDebounce from '../../../../hooks/debounce-hook'
import juralioColours from '../../../../theme/juralio-colours'

const style = makeStyles()(() => ({
  input: {
    height: '32px',
    paddingLeft: '0px',
    transition: 'width 0.5s ease-in-out',
    width: '304px',
    color: 'black',
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  searchIcon: {
    marginLeft: 2,
    cursor: 'pointer',
  },
  textField: {
    height: '32px',
    marginLeft: '8px',
    transition: 'width 0.5s ease-in-out',
    width: '300px',
    color: juralioColours.darkText.primary,
  },
}))

const TemplateSwitcherFilter = props => {
  const { classes } = style()
  const { t } = useTranslation()
  const [searchString, setSearchString] = useState('')
  const debounceValue = useDebounce(searchString, 500)

  const filterTemplates = (templates, searchValue) => {
    if (!searchValue || searchValue.length === 0) return null
    const sanitised = searchValue.toLowerCase()
    return templates
      .filter(template => {
        if (template.name?.toLowerCase().includes(sanitised)) return true
        if (template.providedBy?.toLowerCase().includes(sanitised)) return true
        if (
          template.urlTags?.some(tag => tag.toLowerCase().includes(sanitised))
        )
          return true
        return false
      })
      .map(template => template.id)
  }

  useEffect(() => {
    if (!debounceValue) {
      props.setFilter(null)
      return
    }
    props.setFilter(filterTemplates(props.templates, debounceValue))
  }, [debounceValue, props.templates]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = e => {
    const value = e.target.value
    if (value === '') props.setFilter(null)
    setSearchString(value)
  }

  return (
    <TextField
      data-test="template-switcher-filter"
      data-input-test="template-switcher-filter-input"
      variant="outlined"
      onChange={handleChange}
      className={classes.textField}
      placeholder={t('templates.filter.findATemplate')}
      slotProps={{
        input: {
          startAdornment: <SearchIcon className={classes.searchIcon} />,
          className: classes.input,
        },
      }}
    />
  )
}

export default TemplateSwitcherFilter
