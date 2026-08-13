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
import {
  Checkbox,
  DialogContent,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import JuralioDialog from '../../components/dialog/juralio-dialog/JuralioDialog'
import {
  EXPORT_FORMATS,
  EXPORT_NAMES,
} from '../../services/export/reports/common/constants-reports'
import { generateDownload } from '../../services/export/export-service'
import { displaySnackbar } from '../global-snackbar/global-snackbar-actions'

const ClientCostsExportDialog = props => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [summary, setSummary] = useState(true)
  const [scope, setScope] = useState(true)
  const [assumptions, setAssumptions] = useState(true)
  const [outOfScope, setOutOfScope] = useState(true)
  const [exporting, setExporting] = useState(false)

  const matter = useSelector(state => state.matterDetails.matter)
  const projects = useSelector(state => state.projects?.items) || []
  const advisor = useSelector(
    state =>
      state.matterDetails?.overview?.positionsOfGroups?.find(
        x => x.position?.name === 'Advisor'
      )?.group?.name || ''
  )

  const resetAndClose = () => {
    setSummary(true)
    setScope(true)
    setAssumptions(true)
    setOutOfScope(true)
    props.setShowDownloadDialog(false)
  }

  const generateCheckbox = (checked, setCheck, label, dataTest) => (
    <FormControlLabel
      label={label}
      control={
        <Checkbox
          color="primary"
          checked={checked}
          name={label}
          data-test={dataTest}
          onChange={() => setCheck(!checked)}
        />
      }
    />
  )

  return (
    <JuralioDialog
      disabled={
        exporting || (!summary && !scope && !assumptions && !outOfScope)
      }
      showLoadingBar={exporting}
      titleIcon={DownloadIcon}
      titleText={t(
        'exports.clientCosts.dialogTitle',
        'Download projection data'
      )}
      actionLabel={t('exports.clientCosts.dialogAction', 'Download')}
      handleCancel={resetAndClose}
      open={props.showDownloadDialog}
      handleAction={() => {
        if (exporting) return
        const workstreamNames = {}
        projects.forEach(p => {
          workstreamNames[p.id] = p.name
        })
        const data = {
          ...props.snapshot,
          matter,
          advisor,
          currency: props.currency,
          workstreamNames,
        }
        setExporting(true)
        generateDownload(
          t,
          EXPORT_NAMES.CLIENT_COSTS,
          EXPORT_FORMATS.EXCEL,
          data,
          {
            summary,
            scope,
            assumptions,
            outOfScope,
          }
        )
          .then(() => {
            setExporting(false)
            resetAndClose()
          })
          .catch(() => {
            setExporting(false)
            dispatch(
              displaySnackbar(
                t(
                  'exports.clientCosts.downloadError',
                  'Download failed, please try again'
                )
              )
            )
          })
      }}
    >
      <DialogContent>
        <Typography>
          {t(
            'exports.clientCosts.dialogPrompt',
            'Choose which sheets to include in the download.'
          )}
        </Typography>
        <FormGroup>
          {generateCheckbox(
            summary,
            setSummary,
            t('exports.clientCosts.sheetSummary', 'Projection Summary'),
            'summary-checkbox'
          )}
          {generateCheckbox(
            scope,
            setScope,
            t('exports.clientCosts.sheetScope', 'Scope'),
            'scope-checkbox'
          )}
          {generateCheckbox(
            assumptions,
            setAssumptions,
            t('exports.clientCosts.sheetAssumptions', 'Assumptions'),
            'assumptions-checkbox'
          )}
          {generateCheckbox(
            outOfScope,
            setOutOfScope,
            t('exports.clientCosts.sheetOutOfScope', 'Out-of-Scope Terms'),
            'out-of-scope-checkbox'
          )}
        </FormGroup>
      </DialogContent>
    </JuralioDialog>
  )
}

export default ClientCostsExportDialog
