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
import JuralioDialog from '../../../components/dialog/juralio-dialog/JuralioDialog'
import {
  Checkbox,
  DialogContent,
  FormControlLabel,
  Tooltip,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  EXPORT_FORMATS,
  EXPORT_NAMES,
} from '../../../services/export/reports/common/constants-reports'
import { FormGroup } from '@mui/material'
import { generateDownload } from '../../../services/export/export-service'
import { useSelector } from 'react-redux'
import DownloadIcon from '@mui/icons-material/Download'
import InfoIcon from '@mui/icons-material/Info'
import juralioColours from '../../../theme/juralio-colours'

const CostsExportDialog = props => {
  const { t } = useTranslation()
  const [hours, setHours] = useState(true)
  const [fees, setFees] = useState(true)
  const [costs, setCosts] = useState(true)
  const [grossProfit, setGrossProfit] = useState(true)
  const [margin, setMargin] = useState(true)
  const [rates, setRates] = useState(true)
  const [recoveryRate, setRecoveryRate] = useState(true)
  const matterDetails = useSelector(state => state.matterDetails.matter)
  let data = props.data
  data.matter = matterDetails
  if (props.liveMode) {
    data.matterRatesList = props.rates
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
          onChange={e => {
            setCheck(!checked)
          }}
        />
      }
    />
  )

  return (
    <JuralioDialog
      disabled={
        !hours &&
        !fees &&
        !costs &&
        !grossProfit &&
        !margin &&
        !rates &&
        !recoveryRate
      }
      titleIcon={DownloadIcon}
      titleText={'Download projection data'}
      actionLabel="Download"
      handleCancel={() => {
        props.setShowDownloadDialog(false)
        setHours(false)
        setFees(false)
        setCosts(false)
        setGrossProfit(false)
        setMargin(false)
        setRates(false)
        setRecoveryRate(false)
      }}
      open={props.showDownloadDialog}
      handleAction={() => {
        generateDownload(
          t,
          EXPORT_NAMES.ADVISOR_COSTS,
          EXPORT_FORMATS.EXCEL,
          data,

          {
            //table options go here
            hours,
            fees,
            costs,
            grossProfit,
            margin,
            rates,
            recoveryRate,
          }
        )
        props.setShowDownloadDialog(false)
      }}
    >
      <DialogContent>
        <Typography>
          {t('exports.reportDownload.projectTaskList.confirmation.sheets')}
        </Typography>
        <FormGroup>
          {generateCheckbox(
            hours,
            setHours,
            t('exports.reportDownload.costs.confirmation.hours'),
            'hours-checkbox'
          )}
          {generateCheckbox(
            fees,
            setFees,
            t('exports.reportDownload.costs.confirmation.fees'),
            'fees-checkbox'
          )}
          {generateCheckbox(
            costs,
            setCosts,
            t('exports.reportDownload.costs.confirmation.costs'),
            'costs-checkbox'
          )}
          {generateCheckbox(
            grossProfit,
            setGrossProfit,
            t('exports.reportDownload.costs.confirmation.grossProfit'),
            'gross-profit-checkbox'
          )}
          {generateCheckbox(
            margin,
            setMargin,
            t('exports.reportDownload.costs.confirmation.margin'),
            'margin-checkbox'
          )}
          {generateCheckbox(
            rates,
            setRates,
            t('exports.reportDownload.costs.confirmation.rates'),
            'rates-checkbox'
          )}
          {/* {generateCheckbox(
            recoveryRate,
            setRecoveryRate,
            t('exports.reportDownload.costs.confirmation.recoveryRate'),
            'recoveryRate-checkbox'
          )} */}
          <div
            style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}
          >
            <Typography>
              {t('exports.reportDownload.costs.confirmation.recoveryRateInfo')}
            </Typography>
            <Tooltip
              title={t(
                'exports.reportDownload.costs.confirmation.recoveryRateTooltip'
              )}
            >
              <InfoIcon
                style={{
                  marginLeft: '4px',
                  color: juralioColours.darkText.secondary,
                }}
              />
            </Tooltip>
          </div>
        </FormGroup>
      </DialogContent>
    </JuralioDialog>
  )
}
export default CostsExportDialog
