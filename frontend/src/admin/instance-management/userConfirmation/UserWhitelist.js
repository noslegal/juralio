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

import { Button, Chip, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import {
  checkTextHasNonWhitespaceContent,
  isValidEmail,
} from '../../../services/helpers/text/text-util-helper'
import whitelistService from '../../../services/helpers/user/user-whitelist-api-helper'

const UserWhitelist = props => {
  const [input, setInput] = useState('')
  const [savedEmails, setSavedEmails] = useState([])
  const [error, setError] = useState('')

  const validateUsernames = usernameList => {
    let validatedUsernames = usernameList.map(v => isValidEmail(v))
    return validatedUsernames
  }

  useEffect(() => {
    whitelistService.getAll().then(res => {
      if (res.status === 200) {
        setSavedEmails(res.body)
      }
    })
  }, [])

  useEffect(() => {
    setInput('')
    setError('')
  }, [savedEmails])

  const handleChange = event => {
    event.stopPropagation()
    setInput(event.target.value)
  }

  const saveWhitelist = () => {
    if (!checkTextHasNonWhitespaceContent(input)) return
    const seperatedEmails = input.split(',').map(email => email.trim())
    const uniqueEmails = [
      ...new Set(
        seperatedEmails.filter(
          email =>
            !savedEmails.some(
              savedEmail => savedEmail.whitelisted_email === email
            )
        )
      ),
    ]

    if (uniqueEmails.length === 0) {
      setError(props.t('sysAdmin.instanceManagement.whitelist.noNewEmails'))
      return
    }

    const validatedEmails = validateUsernames(uniqueEmails)
    if (validatedEmails.includes(false)) {
      setError(
        props.t('userCreation.userAddFailedInvalidEmail', {
          email: uniqueEmails[validatedEmails.indexOf(false)],
        })
      )
      return
    }

    whitelistService.add(uniqueEmails).then(res => {
      if (res.status === 200) {
        setSavedEmails([...savedEmails, ...res.body])
      }
    })
  }

  const removeFromWhitelist = emailId => {
    whitelistService.delete(emailId).then(() => {
      setSavedEmails([...savedEmails].filter(item => item.id !== emailId))
    })
  }

  return (
    <div>
      <TextField
        class={null}
        onChange={handleChange}
        fullWidth
        label={props.t('sysAdmin.instanceManagement.whitelist.emailWhitelist')}
        placeholder={props.t(
          'sysAdmin.instanceManagement.whitelist.placeholder'
        )}
        value={input}
      />
      <Button color="primary" variant="contained" onClick={saveWhitelist}>
        {props.t('common.add')}
      </Button>
      {error !== '' && <Typography>{error}</Typography>}
      <br />
      {savedEmails &&
        savedEmails.length > 0 &&
        savedEmails.map((email, index) => {
          return (
            <Chip
              label={email.whitelisted_email}
              key={index}
              onDelete={() => removeFromWhitelist(savedEmails[index].id)}
            />
          )
        })}
    </div>
  )
}
export default UserWhitelist
