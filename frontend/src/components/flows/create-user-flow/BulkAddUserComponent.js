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

import CancelIcon from '@mui/icons-material/Cancel'
import { Autocomplete } from '@mui/material'
import TextField from '@mui/material/TextField'
import uniq from 'lodash/uniq'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isValidEmail } from '../../../services/helpers/text/text-util-helper'
import userService from '../../../services/user/user-service'

const BulkAddUserComponent = props => {
  const { t } = useTranslation()

  const [usernames, setUsernames] = useState([])
  const [currentInput, setCurrentInput] = useState('')
  const [error, setError] = useState(null)
  const [existingUsers, setExistingUsers] = useState([])
  const [tags, setTags] = useState([])
  let isPaste = false

  const validateUsernames = usernameList => {
    let validatedUsernames = usernameList.map(v => isValidEmail(v))
    return validatedUsernames
  }

  useEffect(() => {
    props.update(usernames, error !== null || existingUsers.length > 0)
  }, [usernames]) //eslint-disable-line

  useEffect(() => {
    handleClickAway()
  }, [tags]) //eslint-disable-line

  const handleClickAway = data => {
    //adds to the values list depends on where data is from tags,typed or pasted
    let values = []
    values = usernames
    if (data !== undefined) {
      values = [...tags, data]
    }
    if (currentInput !== '') {
      values = [...tags, currentInput]
    }
    if (tags && tags.length > 0) {
      values = [...tags]
      values = uniq(values)
    }
    const validatedUsernames = validateUsernames(values)
    if (validatedUsernames.includes(false)) {
      setError(
        t('userCreation.userAddFailedInvalidEmail', {
          email: values[values.indexOf(false)],
        })
      )
    }

    if (values.length !== usernames.length) {
      let newEmails = values.filter(v => !usernames.includes(v))
      Promise.all(newEmails.map(ne => userService.getUsersByEmail(ne))).then(
        results => {
          let foundUsers = results
            .filter(u => u.length > 0)
            .map(u => u[0].username)
          setExistingUsers([...existingUsers, ...foundUsers])
          if (foundUsers.length > 0) {
            setError(
              t('userCreation.emailAlreadyInUser', { email: foundUsers[0] })
            )
          }
          let validatedUsernames = validateUsernames(values)
          if (validatedUsernames.includes(false)) {
            setError(
              t('userCreation.userAddFailedInvalidEmail', {
                email: values[validatedUsernames.indexOf(false)],
              })
            )
          }
          setUsernames(values)
        }
      )
    }
  }

  const handleOnOpen = () => {
    setError(null)
    setUsernames([])
  }

  return (
    <div onKeyDown={e => e.stopPropagation()} style={{ width: '100%' }}>
      <Autocomplete
        onPaste={_ => {
          isPaste = true
        }}
        onOpen={_ => {
          handleOnOpen()
        }}
        multiple={props.multiple}
        onBlur={(_, v) => handleClickAway(v)}
        className={props.class}
        freeSolo
        data-test="email"
        renderInput={params => (
          <TextField
            {...params}
            variant="standard"
            label={
              error
                ? error
                : `Enter email address. ${
                    props.multiple ? 'Press \u{23CE} to add another' : ''
                  }`
            }
            error={error ? true : false}
          />
        )}
        options={[]}
        onInputChange={(_, v) => {
          setCurrentInput(v)
          if (isPaste) {
            handleClickAway(v)
            isPaste = false
          }
        }}
        onChange={(_, v) => {
          if (typeof v === 'string') {
            setTags([v])
          } else {
            setTags(v)
          }
        }}
        clearIcon={
          <CancelIcon
            onClick={() => {
              setUsernames([])
              setTags([])
            }}
          />
        }
      />
    </div>
  )
}

export default BulkAddUserComponent
