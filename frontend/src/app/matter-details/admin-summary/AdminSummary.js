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

import { Divider, Paper } from '@mui/material'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { OPERATION_MODE } from '../../../app/constants'
import { useIsViewOnly } from '../../../hooks/matter/viewer/matter-viewer-hooks'
import { MattersIcon } from '../../../theme/navigation/CommonIcons'
import PanelTitle from '../../organisation/users/panels/PanelTitle'
import MatterFieldsPanel from './panels/MatterFieldsPanel'
import TeamSummaryPanel from './panels/TeamSummaryPanel'
import WorkstreamPanel from './panels/WorkstreamPanel'
import MatterAdminFtue from '../../../components/data-display/ftue/matter-admin/MatterAdminFtue'
import { getDetailsAttribute } from '../../../services/user/user-data-service'

const useStyles = makeStyles()(theme => ({
  root: {
    padding: theme.spacing(3),
    textAlign: 'left',
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}))

const AdminSummary = props => {
  useEffect(() => {
    props.fetch(props.matter.id)
  }, []) // eslint-disable-line

  const { t } = useTranslation()
  const { classes } = useStyles()
  const { matter } = props
  const isViewOnly = useIsViewOnly(matter)

  if (!matter) return null

  return (
    <Paper className={classes.root}>
      {!getDetailsAttribute([
        'firstTimeUserExperience',
        'hasSeenMatterAdmin',
      ]) && <MatterAdminFtue />}
      <PanelTitle
        icon={<MattersIcon />}
        header={t('matterAdmin.overview.header')}
        caption={''}
      />
      <MatterFieldsPanel
        matter={matter}
        readOnly={props.mode === OPERATION_MODE.VIEW || isViewOnly}
        item={props.item}
      />
      <Divider className={classes.divider} />
      <WorkstreamPanel matter={matter} />
      <Divider className={classes.divider} />
      <TeamSummaryPanel matter={matter} />
    </Paper>
  )
}
export default AdminSummary
