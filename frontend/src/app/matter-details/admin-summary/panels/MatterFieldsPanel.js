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

import { Button } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import ClientAvatar from '../../../../components/data-display/client/ClientAvatar'
import GroupAvatar from '../../../../components/layouts/manage-users/GroupAvatar'
import PanelWithIcon from '../../../../components/data-display/panel-with-icon/PanelWithIcon'
import { POSITIONS } from '../../../constants'
import TwoLineLabel from '../../../../components/data-display/two-line-label/TwoLineLabel'
import { useIsViewOnly } from '../../../../hooks/matter/viewer/matter-viewer-hooks'
import { EditIcon } from '../../../../theme/navigation/CommonIcons'
import { updateMatterDetails } from '../../../matter-details/matter-details-actions'
import MatterStatusToggle from '../../matter-card/MatterStatusToggle'
import MatterDetailsDialog from './dialogs/MatterDetailsDialog'

const useStyles = makeStyles()(theme => ({
  root: {
    width: '100%',
    padding: theme.spacing(),
    textAlign: 'left',
  },
  matterNameAndStatusRow: {
    display: 'flex',
    width: theme.spacing(40),
    justifyContent: 'space-between',
  },
  matterStatusToggle: {
    paddingTop: theme.spacing(),
    paddingLeft: theme.spacing(5),
  },
  matterReferenceRow: {
    display: 'flex',
    width: theme.spacing(40),
    justifyContent: 'space-between',
  },
}))

const MatterFieldsPanel = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { matter } = props
  const isViewOnly = useIsViewOnly(matter)
  const overview = useSelector(state => state.matterDetails.overview)

  const clientGroup = (
    matter?.positionsOfGroups?.length
      ? matter.positionsOfGroups
      : overview?.positionsOfGroups
  )?.find(
    positionOfGroup => positionOfGroup.position?.name === POSITIONS.CLIENT.name
  )?.group

  const [searchParams, setSearchParams] = useSearchParams()
  const [showEditMatterDetailsDialog, setShowEditMatterDetailsDialog] =
    useState(false)

  useEffect(() => {
    if (searchParams.get('openEditDetails')) {
      setShowEditMatterDetailsDialog(true)
      setSearchParams(
        prev => {
          prev.delete('openEditDetails')
          return prev
        },
        { replace: true }
      )
    }
  }, [searchParams, setSearchParams])

  const performUpdate = matterUpdates => {
    dispatch(
      updateMatterDetails(matter.id, {
        name: matterUpdates.matterName,
        clientName: matterUpdates.clientName,
        department: matterUpdates.department,
        userDefinedReferenceNumber: matterUpdates.matterReferenceNumber,
        matterStatus: matterUpdates.matterStatus,
      })
    )
  }

  const toggleStatus = (event, value) => performUpdate({ matterStatus: value })

  if (!matter) return null

  const matterNumberEntry =
    matter.userDefinedReferenceNumber === undefined ||
    matter.userDefinedReferenceNumber?.length === 0
      ? 'None'
      : matter.userDefinedReferenceNumber

  return (
    <div className={classes.root}>
      <PanelWithIcon>
        {clientGroup ? (
          <GroupAvatar
            group={clientGroup}
            orgId={clientGroup.organisationId}
            editable={false}
          />
        ) : (
          <ClientAvatar clientName={matter.clientName} />
        )}
        <TwoLineLabel
          heading={t('entity.client')}
          entry={matter.clientName}
          dataTest={'client-name'}
        />

        <TwoLineLabel
          heading={t('matterDetails.placeholderDepartment')}
          entry={matter.department ? matter.department : '-'}
          dataTest={'department'}
        />

        <div className={classes.matterNameAndStatusRow}>
          <TwoLineLabel
            heading={t('entity.matter')}
            entry={matter.name}
            dataTest={'matter-name'}
          />
          <div className={classes.matterStatusToggle}>
            <MatterStatusToggle
              currentValue={matter.matterStatus}
              updateStatus={toggleStatus}
              readOnly={props.readOnly}
            />
          </div>
        </div>
        <div className={classes.matterReferenceRow}>
          <TwoLineLabel
            heading={t('matterDetails.matterNumber')}
            entry={matterNumberEntry}
            dataTest={'user-defined-reference-number'}
            infoTipText={t('matterDetails.matterNumberInfoTip')}
          />
          <TwoLineLabel
            heading={t('matterDetails.matterJuralioReference')}
            entry={matter.matterId}
            dataTest={'juralio-reference-number'}
            infoTipText={t('matterDetails.matterJuralioReferenceNumberInfoTip')}
          />
        </div>
        <Button
          color="primary"
          disabled={isViewOnly}
          onClick={() => setShowEditMatterDetailsDialog(true)}
          data-test="edit-matter-details-button"
          label={t('matterAdmin.workstreams.editMatterDetails')}
          startIcon={<EditIcon />}
        >
          {t('matterAdmin.workstreams.editMatterDetails')}
        </Button>
      </PanelWithIcon>
      {showEditMatterDetailsDialog && (
        <MatterDetailsDialog
          matter={matter}
          onClose={() => {}}
          handleCloseDialog={() => setShowEditMatterDetailsDialog(false)}
          handleSaveDialog={matterUpdates => {
            performUpdate(matterUpdates)
            setShowEditMatterDetailsDialog(false)
          }}
        />
      )}
    </div>
  )
}
export default MatterFieldsPanel
