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
import { TextField } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'
import juralioColours from '../../../theme/juralio-colours'

const styles = makeStyles()(theme => ({
  textField: {
    width: '100%',
    marginLeft: 'auto',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    borderColor: '#333232',

    '& label.Mui-focused': {
      color: 'white',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: '#333232',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#333232',
      },
      '&:hover fieldset': {
        borderColor: '#333232',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#333232',
      },
    },
  },
  globalColours: {
    width: '100%',
    marginLeft: 'auto',
    color: 'white',
    backgroundColor: juralioColours.globalHeader.background,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}))

const Search = props => {
  const { classes } = styles()
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const onFocus = () => {
    props.onFocus()
  }

  useEffect(() => {
    if (!props.focused) {
      setInput('')
    }
  }, [props.focused])

  return (
    <TextField
      autoFocus
      id="search-component"
      variant="outlined"
      data-test="global-searchbar"
      onFocus={onFocus}
      value={input}
      onChange={e => {
        setInput(e.target.value)
        props.onInputChange(e)
      }}
      className={classes.textField}
      style={{
        maxWidth: !props.focused ? '200px' : '',
        borderColor: 'white',
      }}
      sx={{
        input: {
          '&::placeholder': {
            opacity: 1,
          },
        },
      }}
      placeholder={
        props.searchPlaceholder
          ? props.searchPlaceholder
          : t('globalSearch.searchYourStuff')
      }
      slotProps={{
        htmlInput: {
          className: classes.globalColours,
        },
      }}
    />
  )
}

export default Search
