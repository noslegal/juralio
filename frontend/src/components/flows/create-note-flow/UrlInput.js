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

import { TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { MAX_FIELD_LENGTHS } from '../../../app/constants'
import {
  isValidUrl,
  sanitizeUrl,
} from '../../../services/helpers/text/text-util-helper'
import rawColours from '../../../theme/raw-colours'

const style = theme => ({
  url: {
    width: '100%',
    paddingTop: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  errorLink: {
    cursor: 'pointer',
    color: rawColours.error.primary,
  },
})

const UrlInput = props => {
  const { t } = useTranslation()
  const instanceSettings = useSelector(state => state.instanceSettings.settings)
  const validateUrl = instanceSettings.enableUrlValidation

  const [urlValid, setUrlValid] = useState(true)
  const [url, setUrl] = useState(props.url !== undefined ? props.url : '')
  const { classes } = makeStyles()(style)()

  useEffect(() => {
    onChange({ target: { value: props.url } })
  }, [props.url]) //eslint-disable-line

  const onChange = e => {
    const value = sanitizeUrl(e.target.value)
    setUrl(value)

    if (validateUrl) {
      const isValid = isValidUrl(value)
      setUrlValid(isValid)
      props.isValidUrl(isValid)
    } else {
      setUrlValid(true)
      props.isValidUrl(true)
    }
    props.changeUrl(value)
  }

  const sanitizeUrlInput = e => {
    const value = e?.target?.value
    const sanitizedValue = sanitizeUrl(value)

    if (sanitizedValue.length && sanitizedValue !== value) {
      onChange({ target: { value: sanitizedValue } })
    }
  }

  useEffect(() => {
    const value = sanitizeUrl(props.url)

    if (validateUrl) {
      const isValid = isValidUrl(value)
      setUrlValid(isValid)
      props.isValidUrl(isValid)
    } else {
      setUrlValid(true)
      props.isValidUrl(true)
    }
    props.changeUrl(value)
  }, [props, props.url]) //eslint-disable-line

  return (
    <TextField
      className={classes.url}
      placeholder={t('createNoteFlow.addUrl')}
      data-test="link-url"
      onChange={onChange}
      onBlur={e => sanitizeUrlInput(e.target.value, true)}
      value={url}
      helperText={
        !urlValid && url.length > 0
          ? t('commonValidationMessages.validHttpUrl')
          : ''
      }
      error={!urlValid && url.length > 0}
      slotProps={{
        htmlInput: {
          maxLength: MAX_FIELD_LENGTHS.URL,
        },
      }}
    />
  )
}

export default UrlInput
