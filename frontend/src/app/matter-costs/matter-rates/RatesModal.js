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

import { IconButton, Paper } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'
import MatterRatesTable from './MatterRatesTable'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'

const useStyles = makeStyles()(theme => ({
  modalPaper: {
    position: 'relative',
    width: '90%',
    maxWidth: 1000,
    borderRadius: 20,
    paddingTop: theme.spacing(2.5),
    overflow: 'hidden',
  },
  modalContent: {
    overflowX: 'auto',
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    color: juralioColours.darkText.secondary,
    zIndex: 1,
  },
}))

const RatesModal = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const {
    setDoReplace,
    rates,
    setRates,
    matterRTD,
    rateTypes,
    periods,
    editRates,
    setEditRates,
    setShowRatesModal,
    orgId,
    isViewOnly,
  } = props
  const matterId = props.matterId
  const isMatterAdmin = props.isMatterAdmin

  const isSnapshot = props.selectedSnapshotRates ? true : false
  const statusBorderColour = isSnapshot
    ? juralioColours.taskStatus.done
    : juralioColours.taskStatus.inProgress
  const statusBackgroundColour = isSnapshot
    ? rawColours.status.done.light
    : rawColours.status.inProgress.light

  return (
    <Paper
      className={classes.modalPaper}
      style={{
        backgroundColor: statusBackgroundColour,
        border: `2px solid ${statusBorderColour}`,
      }}
    >
      <IconButton
        data-test="close-rates"
        aria-label={t('common.close')}
        className={classes.closeButton}
        onClick={() => setShowRatesModal(false)}
        size="small"
      >
        <CloseIcon />
      </IconButton>
      <div className={classes.modalContent}>
        <MatterRatesTable
          isMatterAdmin={isMatterAdmin}
          rates={
            props.selectedSnapshotRates ? props.selectedSnapshotRates : rates
          }
          isSnapshot={props.selectedSnapshotRates ? true : false}
          snapshotDate={props.selectedSnapshotDate}
          rateTypes={rateTypes}
          orgId={orgId}
          period={
            props.selectedSnapshotPeriods
              ? props.selectedSnapshotPeriods
              : periods
          }
          rtd={
            props.selectedSnapshotRtd ? props.selectedSnapshotRtd : matterRTD
          }
          isFirstTimeFlow={false}
          setRates={setRates}
          setDoReplace={setDoReplace}
          matterId={matterId}
          editRates={editRates}
          setEditRates={setEditRates}
          setShowRatesModal={setShowRatesModal}
          setSelectedPage={props.setSelectedPage}
          isModal={true}
          isViewOnly={isViewOnly}
        />
      </div>
    </Paper>
  )
}
export default RatesModal
