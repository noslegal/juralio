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
  Radio,
  RadioGroup,
  Typography,
  useMediaQuery,
} from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import JurNote from '../../../../assets/images/JurNote'
import JuralioDialog from '../../../../components/dialog/juralio-dialog/JuralioDialog'
import juralioTheme from '../../../../theme/juralio-theme'

const style = makeStyles()(theme => ({
  radioOption: {
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'flex',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(2),
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(2),
  },
  optionTitle: {
    marginLeft: theme.spacing(8),
    marginRight: theme.spacing(2),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
}))

const TaskDownloadDialog = props => {
  const [printType, setPrintType] = useState('A4')
  const [includePosts, setIncludePosts] = useState(true)
  const { t } = useTranslation()
  const { classes } = style()
  const isMobileView = useMediaQuery(juralioTheme.breakpoints.down('md'))

  const handlePrintTypeChange = event => setPrintType(event.target.value)
  return (
    <JuralioDialog
      open={props.open}
      titleText={
        <div>
          <Typography variant="h6">
            {t('exports.reportDownload.taskDetails.taskDownload', {
              name: props.taskName,
            })}
          </Typography>
        </div>
      }
      titleIcon={JurNote}
      handleCancel={props.close}
      onClose={props.close}
      fullScreen={isMobileView}
      handleAction={() => props.download(printType, includePosts)}
      actionLabel={t('sysAdmin.organisations.confirm')}
    >
      <div className={classes.column}>
        <Typography
          className={classes.optionTitle}
          style={{ marginRight: '24px' }}
        >
          {t('exports.reportDownload.taskDetails.paperFormat')}
        </Typography>
        <RadioGroup
          name="printType"
          value={printType}
          onChange={handlePrintTypeChange}
        >
          <div className={classes.radioOption}>
            <FormControlLabel
              value="A4"
              control={
                <Radio color={'primary'} style={{ marginLeft: '35px' }} />
              }
              label={t(
                'exports.reportDownload.projectTaskList.confirmation.A4'
              )}
            />
            <FormControlLabel
              value="Letter"
              control={<Radio color={'primary'} />}
              label={t(
                'exports.reportDownload.projectTaskList.confirmation.letter'
              )}
            />
          </div>
        </RadioGroup>
      </div>
      <div className={classes.row}>
        <Typography className={classes.optionTitle}>
          {t('exports.reportDownload.taskDetails.includePosts')}
        </Typography>

        <Checkbox
          checked={includePosts}
          color="primary"
          onChange={() => setIncludePosts(!includePosts)}
        />
      </div>
    </JuralioDialog>
  )
}
export default TaskDownloadDialog
