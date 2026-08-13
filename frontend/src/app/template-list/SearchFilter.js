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
import { TextField, Tooltip } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import useDebounce from '../../hooks/debounce-hook'
import juralioColours from '../../theme/juralio-colours'
import rawColours from '../../theme/raw-colours'

const styles = makeStyles()(theme => ({
  textField: {
    height: '32px',
    marginLeft: '8px',
    transition: 'width 0.5s ease-in-out',
    width: '300px',
    color: juralioColours.darkText.primary,
  },
  input: {
    height: '32px',
    paddingLeft: '0px',
    transition: 'width 0.5s ease-in-out',
    width: '304px',
    color: juralioColours.darkText.primary,
  },
  searchIcon: {
    marginLeft: theme.spacing(0.5),
    cursor: 'pointer',
  },
}))

const SearchFilter = props => {
  const { classes } = styles()
  const ref = useRef(null)
  const [string, setString] = useState(props.filterString)
  const debounceValue = useDebounce(string, 500)

  useEffect(() => {
    props.setFilterString(debounceValue)
  }, [debounceValue]) //eslint-disable-line

  useEffect(() => {
    setString(props.filterString)
  }, [props.filterString]) //eslint-disalbe-line

  return (
    <TextField
      className={classes.textField}
      onClick={() => {
        ref.current.focus()
      }}
      value={string}
      onChange={e => setString(e.target.value.toLowerCase())}
      placeholder={props.helperText}
      variant="outlined"
      data-test="search-filter"
      slotProps={{
        input: {
          startAdornment: (
            <Tooltip title={props.helperText}>
              <SearchIcon className={classes.searchIcon} />
            </Tooltip>
          ),
          className: classes.input,
          inputRef: ref,
          style: { color: rawColours.text.black },
        },
      }}
    />
  )
}
export default SearchFilter
