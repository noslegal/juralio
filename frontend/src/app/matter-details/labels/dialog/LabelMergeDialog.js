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
  DialogContent,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import JuralioDialog from '../../../../components/dialog/juralio-dialog/JuralioDialog'
import labelService from '../../../../services/label/label-service'
import juralioTheme from '../../../../theme/juralio-theme'
import rawColours from '../../../../theme/raw-colours'
import { displaySnackbar } from '../../../global-snackbar/global-snackbar-actions'
import { getMatterLabels } from '../redux/matter-admin-labels-actions'

const style = makeStyles()(theme => ({
  autocomplete: {
    marginTop: theme.spacing(2),
  },
  mergeTarget: {
    display: 'flex',
    marginTop: theme.spacing(2),
    alignItems: 'center',
  },
  mergeText: {
    marginRight: theme.spacing(0.5),
  },
  mergeErrorText: {
    marginRight: theme.spacing(0.5),
    marginTop: theme.spacing(2),
    color: rawColours.primary.red.primary,
    fontWeight: 'bold',
    whiteSpace: 'pre-line',
  },
}))

const LabelMergeDialog = props => {
  const { t } = useTranslation()
  const { classes } = style()
  const isMobileView = useMediaQuery(juralioTheme.breakpoints.down('md'))
  const [label1, setLabel1] = useState(null)
  const [screen, setScreen] = useState(0)
  const [label2, setLabel2] = useState(null)
  const [labelToMerge, setLabelToMerge] = useState(0)
  const matter = useSelector(state => state.matterDetails.matter)
  const [isInactive, setIsInactive] = useState(false)

  useEffect(() => {
    setIsInactive(label1 && label1.inactive && label2 && label2.inactive)
    if (label1 && label1.inactive) {
      setLabelToMerge(1)
    }
  }, [label1, label2])
  const dispatch = useDispatch()

  const handleMerge = () => {
    const master = labelToMerge === 0 ? label1.id : label2.id
    const minor = labelToMerge === 0 ? label2.id : label1.id
    labelService.mergeLabels(matter.id, master, minor).then(res => {
      if (res.status === 200) {
        dispatch(getMatterLabels(matter.id))
        props.close()
      } else {
        dispatch(getMatterLabels(matter.id))
        dispatch(displaySnackbar(t('matterAdmin.labels.mergeError')))
        props.close()
      }
    })
  }

  const getScreen0 = () => {
    return (
      <>
        <Typography>{t('matterAdmin.labels.mergeSubtitle')}</Typography>
        <Autocomplete
          className={classes.autocomplete}
          options={props.labels.filter(l => l.id !== label2?.id)}
          renderOption={(params, option) => {
            return <Typography {...params}>{option.name}</Typography>
          }}
          onChange={(e, v) => setLabel1(v)}
          getOptionLabel={option => option.name}
          renderInput={params => <TextField {...params} label="Label #1" />}
          data-test="merge-label-1"
        />
        <Autocomplete
          className={classes.autocomplete}
          options={props.labels.filter(l => l.id !== label1?.id)}
          renderOption={(params, option) => {
            return <Typography {...params}>{option.name}</Typography>
          }}
          onChange={(e, v) => setLabel2(v)}
          getOptionLabel={option => option.name}
          renderInput={params => <TextField {...params} label="Label #2" />}
          data-test="merge-label-2"
        />
        {isInactive && (
          <Typography
            className={classes.mergeErrorText}
            data-test="merge-error-text"
          >
            {t('matterAdmin.labels.inactiveLabelsMergeError')}
          </Typography>
        )}
        {label1 && label2 && !isInactive && (
          <div className={classes.mergeTarget}>
            <Typography className={classes.mergeText}>
              {t('matterAdmin.labels.mergeTarget')}
            </Typography>
            <Select
              value={labelToMerge}
              onChange={e => setLabelToMerge(e.target.value)}
              data-test="label-select"
            >
              {!label1.inactive && <MenuItem value={0}>{label1.name}</MenuItem>}
              {!label2.inactive && <MenuItem value={1}>{label2.name}</MenuItem>}
            </Select>
          </div>
        )}
      </>
    )
  }

  const getScreen1 = () => {
    return (
      <Typography data-test="label-merge-confirm">
        {t('matterAdmin.labels.mergeConfirm1')}{' '}
        <b>#{labelToMerge === 0 ? label2.name : label1.name}</b>{' '}
        {t('matterAdmin.labels.mergeConfirm2')}
      </Typography>
    )
  }

  const getScreen = () => {
    switch (screen) {
      case 0:
        return getScreen0()
      case 1:
        return getScreen1()
      default:
        return getScreen0()
    }
  }

  return (
    <JuralioDialog
      open={true}
      titleText={t('matterAdmin.labels.mergeHashtags')}
      handleCancel={props.close}
      onClose={props.close}
      disabled={label1 == null || label2 == null || isInactive}
      fullScreen={isMobileView}
      context={screen}
      handleAction={() => (screen === 0 ? setScreen(1) : handleMerge())}
      actionLabel={t('common.confirm')}
    >
      <DialogContent>{getScreen()}</DialogContent>
    </JuralioDialog>
  )
}
export default LabelMergeDialog
