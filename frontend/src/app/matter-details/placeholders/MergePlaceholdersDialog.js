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

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import JuralioDialog from '../../../components/dialog/juralio-dialog/JuralioDialog'
import {
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { formatUserDisplayNameAndUserName } from '../../../services/user/helper/user-format-service'
import placeholderService from '../../../services/placeholders/placeholder-service'
import rawColours from '../../../theme/raw-colours'

const styles = makeStyles()(theme => ({
  masterWrapper: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderDropdown: {
    marginTop: theme.spacing(2),
  },
  masterSelector: {
    width: '40%',
    marginLeft: theme.spacing(2),
  },
  contentWrapper: {
    marginTop: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
  },
  error: {
    color: rawColours.error.primary,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(4),
  },
}))

const MergePlaceholdersDialog = props => {
  const { t } = useTranslation()
  const [placeholder1, setPlaceholder1] = useState(null)
  const [placeholder2, setPlaceholder2] = useState(null)
  const [master, setMaster] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const { classes } = styles()

  const handleAction = () => {
    setError(false)
    setLoading(true)

    placeholderService
      .mergePlaceholders(props.matterId, placeholder1, placeholder2, master)
      .then(res => {
        if (res.status === 200) {
          props.callback(true)
        } else {
          setError(true)
          setLoading(false)
        }
      })
  }

  const _formatName = placeholder =>
    formatUserDisplayNameAndUserName({
      firstname: placeholder.firstName,
      lastname: placeholder.lastName,
      username: placeholder.emailAddress,
    })

  const generateDropdown = (title, value, handleChange, filterList = []) => {
    return (
      <FormControl
        fullWidth
        className={classes.placeholderDropdown}
        data-test="merge-placeholder-select"
      >
        <InputLabel id="merge-placeholder-select">{title}</InputLabel>
        <Select
          labelId="merge-placeholder-select-label"
          value={value}
          label={title}
          disabled={loading}
          onChange={handleChange}
        >
          {props.placeholders
            .filter(placeholder => !filterList.includes(placeholder.id))
            .map(p => {
              return (
                <MenuItem value={p.id} data-test={`placeholder-option`}>
                  {_formatName(p)}
                </MenuItem>
              )
            })}
        </Select>
      </FormControl>
    )
  }
  const generateMasterDropdown = () => {
    let p1 = props.placeholders.find(p => p.id === placeholder1)
    let p2 = props.placeholders.find(p => p.id === placeholder2)
    return (
      <FormControl
        className={classes.masterSelector}
        data-test="merge-placeholder-master-select"
      >
        <Select
          labelId="merge-placeholder-master-select-label"
          value={master}
          disabled={!placeholder1 || !placeholder2 || loading}
          onChange={e => {
            setMaster(e.target.value)
          }}
        >
          {p1 && (
            <MenuItem value={placeholder1} data-test="merge-master-option-1">
              {_formatName(p1)}
            </MenuItem>
          )}
          {p2 && (
            <MenuItem value={placeholder2} data-test="merge-master-option-2">
              {_formatName(p2)}
            </MenuItem>
          )}
        </Select>
      </FormControl>
    )
  }

  return (
    <JuralioDialog
      open={true}
      titleText={t('matterAdmin.placeholders.mergeDialog.title')}
      actionLabel={t('matterAdmin.placeholders.mergeDialog.merge')}
      handleAction={() => {
        handleAction()
      }}
      handleCancel={props.callback}
      cancelText={t('common.cancel')}
      disabled={!placeholder1 || !placeholder2 || !master || loading}
      showLoadingBar={loading}
      loadingText={t('matterAdmin.placeholders.mergeDialog.merging')}
    >
      <DialogContent className={classes.contentWrapper}>
        <>
          <Typography>
            {t('matterAdmin.placeholders.mergeDialog.subtitle')}
          </Typography>
          {props.placeholders &&
            generateDropdown(
              t('matterAdmin.placeholders.mergeDialog.placeholder#1'),
              placeholder1,
              e => {
                setPlaceholder1(e.target.value)
              },
              [placeholder2]
            )}
          {props.placeholders &&
            generateDropdown(
              t('matterAdmin.placeholders.mergeDialog.placeholder#2'),
              placeholder2,
              e => {
                setPlaceholder2(e.target.value)
              },
              [placeholder1]
            )}
          <div className={classes.masterWrapper}>
            <Typography>
              {t('matterAdmin.placeholders.mergeDialog.newPlaceholder')}
            </Typography>
            {props.placeholders && generateMasterDropdown()}
          </div>
        </>
        {error && (
          <Typography className={classes.error} data-test="merge-error-text">
            {t('matterAdmin.placeholders.mergeDialog.error')}
          </Typography>
        )}
      </DialogContent>
    </JuralioDialog>
  )
}

export default MergePlaceholdersDialog
