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

import People from '@mui/icons-material/People'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { Button, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { makeStyles } from 'tss-react/mui'
import PanelWithIcon from '../../../../components/data-display/panel-with-icon/PanelWithIcon'
import { getMatterIdFromLocation } from '../../../../components/navigation/common/location-context-helper'
import { useIsViewOnly } from '../../../../hooks/matter/viewer/matter-viewer-hooks'

const useStyles = makeStyles()(theme => ({
  root: {
    width: '100%',
    padding: theme.spacing(),
    textAlign: 'left',
  },
  peopleIcon: {
    height: theme.spacing(5),
    marginLeft: theme.spacing(0.5),
    width: theme.spacing(5),
  },
  breakdown: {
    paddingTop: theme.spacing(0.5),
  },
  breakdownNumber: {
    paddingTop: theme.spacing(0.5),
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing(),
  },
  breakdownWrapper: { display: 'flex', alignItems: 'center' },
  addPeopleButton: {
    marginTop: theme.spacing(1.5),
  },
}))

const TeamSummaryPanel = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const history = useNavigate()
  const location = useLocation()
  const { matter } = props
  const isViewOnly = useIsViewOnly({ activities: [] })

  const teamMemberCount = matter.team == null ? 0 : matter.team
  const matterViewerCount = matter.viewers == null ? 0 : matter.viewers

  if (!matter) return null

  return (
    <div className={classes.root} data-test="team-summary-panel">
      <PanelWithIcon>
        <People className={classes.peopleIcon} />
        <div className={classes.breakdownWrapper}>
          <Typography variant="body1" className={classes.breakdown}>
            {t('matterAdmin.people.peopleBreakdown1')}
          </Typography>
          <Typography
            variant="h6"
            className={classes.breakdownNumber}
            data-test="matter-team-size"
          >
            {teamMemberCount}
          </Typography>
          <Typography variant="body1" className={classes.breakdown}>
            {t(
              teamMemberCount === 1
                ? 'matterAdmin.people.peopleBreakdown2'
                : 'matterAdmin.people.peopleBreakdown2_other',
              { count: matter.team }
            )}
          </Typography>

          <Typography
            variant="h6"
            className={classes.breakdownNumber}
            data-test="matter-admins-count"
          >
            {matterViewerCount}
          </Typography>
          <Typography variant="body1" className={classes.breakdown}>
            {t(
              matterViewerCount === 1
                ? 'matterAdmin.people.peopleBreakdown3'
                : 'matterAdmin.people.peopleBreakdown3_other',
              { count: matterViewerCount }
            )}
          </Typography>

          <Typography
            variant="h6"
            className={classes.breakdownNumber}
            data-test="matter-admins-count"
          >
            {matter.admins}
          </Typography>
          <Typography variant="body1" className={classes.breakdown}>
            {t(
              matter.admins === 1
                ? 'matterAdmin.people.peopleBreakdown4'
                : 'matterAdmin.people.peopleBreakdown4_other',
              { count: matter.admins }
            )}
          </Typography>
        </div>
        <Button
          className={classes.addPeopleButton}
          variant="outlined"
          color="primary"
          startIcon={<PersonAddIcon className={classes.addIcon} />}
          onClick={() =>
            history(`/matteradmin/${getMatterIdFromLocation(location)}`, {
              state: { tabItem: 1, immediateAddTeamMembers: true },
            })
          }
          disabled={isViewOnly}
          data-test="add-user-matter-button"
        >
          {t('addUsersDialog.dialogTitle')}
        </Button>
      </PanelWithIcon>
    </div>
  )
}

export default TeamSummaryPanel
