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

import {
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import InfoTooltip from '../../../../components/data-display/info-tooltip/InfoTooltip'
import JuralioChip from '../../../../components/data-display/juralio-chip/JuralioChip'
import UserAvatar from '../../../../components/data-display/user/user-avatar/UserAvatar'
import { formatFirstAndLastName } from '../../../../services/user/helper/user-format-service'
import juralioColours from '../../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  content: {
    height: theme.spacing(40),
    overflowY: 'scroll',
  },
  Textbox: {
    width: '95%',
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(3),
  },
  dialogHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  dialogHeaderTitle: {
    paddingLeft: theme.spacing(1),
  },
  error: {
    color: juralioColours.error,
  },
  errorMessage: {
    display: 'flex',
  },
  errorIcon: {
    paddingRight: theme.spacing(1),
    color: juralioColours.error,
  },
  projectSelectDiv: {
    width: '95%',
  },
  privateWorkstreamCheckboxWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  endAdornment: { top: 0 },
  userNameContainer: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: 'bold',
  },
  userFullname: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(0.5),
    whiteSpace: 'nowrap',
    fontWeight: 'bold',
    width: theme.spacing(27),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chip: {
    padding: theme.spacing(1),
  },
  privateSection: {
    paddingTop: theme.spacing(1),
    overflowX: 'hidden',
    height: theme.spacing(16),
  },
  helperText: {
    marginTop: theme.spacing(2),
  },
}))

const CreatePrivateWorkstream = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  const [isPrivate, setIsPrivate] = useState(false)

  const renderUser = (params, u, state) => {
    const user = u.user

    return (
      <div
        {...params}
        className={classes.userNameContainer}
        title={user.username}
        data-test="add-user-flow-autocomplete-option"
      >
        <UserAvatar user={user} />
        <Typography variant="body2" className={classes.userFullname}>
          {(user.firstname || user.lastname) && formatFirstAndLastName(user)}
          {!user.firstname && !user.lastname && user.username}
        </Typography>
        {(user.firstname || user.lastname) && (
          <Typography
            variant="body2"
            data-test="add-user-flow-autocomplete-username"
          >
            ({user.username})
          </Typography>
        )}
      </div>
    )
  }
  return (
    <>
      <div className={classes.privateWorkstreamCheckboxWrapper}>
        <FormControlLabel
          value="end"
          control={
            <Checkbox
              data-test="toggle-private-workstream"
              color="primary"
              checked={isPrivate}
              onChange={() => {
                setIsPrivate(!isPrivate)
                props.handleWorkstreamIsPrivateChange(!isPrivate)
              }}
            />
          }
          label={t('projectCreation.makePrivate')}
          labelPlacement="end"
        />
        <InfoTooltip text={t('projectCreation.privateExplanation')} />
      </div>
      {isPrivate && (
        <>
          <Typography>{t('projectCreation.addingPeople')}</Typography>
          <div className={classes.privateSection}>
            <Autocomplete
              disableCloseOnSelect
              data-test="add-user-flow-autocomplete"
              loading={true}
              loadingText={
                props.isLoadingUsers ? (
                  <Typography>{t('common.loading')}</Typography>
                ) : (
                  <Typography>{t('addUsersDialog.noOptions')}</Typography>
                )
              }
              multiple
              id="tags-outlined"
              classes={{ endAdornment: classes.endAdornment }}
              options={props.usersInMatter.filter(
                user => user.isPlaceholder === false
              )}
              onChange={(event, value) => props.addUser(value)}
              getOptionLabel={option => option.user.username}
              renderOption={renderUser}
              filterSelectedOptions
              renderValue={(value, getItemProps) =>
                value.map((user, index) => (
                  <div
                    key={user.user.id}
                    className={classes.chip}
                    data-test="add-user-flow-autocomplete-user-chip"
                  >
                    <JuralioChip
                      user={user.user}
                      compactAvatar={true}
                      handleChipDelete={() => props.handleChipDelete(user.user)}
                      {...getItemProps({ index })}
                    />
                  </div>
                ))
              }
              filterOptions={(options, state) =>
                options.filter(option =>
                  `${option.user.firstname?.toLowerCase()} ${option.user.lastname?.toLowerCase()} (${option.user.username?.toLowerCase()})`.includes(
                    state.inputValue.toLowerCase()
                  )
                )
              }
              renderInput={params => (
                <TextField
                  {...params}
                  variant="standard"
                  label={t('common.searchForSomeone')}
                  data-test="add-user-flow-autocomplete-text-field"
                />
              )}
              value={props.addedUsers}
            />
            <Typography
              className={classes.helperText}
              data-test="add-user-flow-autocomplete-username"
            >
              {t('projectCreation.privateAddSelf')}
            </Typography>
          </div>
        </>
      )}
    </>
  )
}

CreatePrivateWorkstream.propTypes = {
  usersInMatter: PropTypes.array,
}

export default CreatePrivateWorkstream
