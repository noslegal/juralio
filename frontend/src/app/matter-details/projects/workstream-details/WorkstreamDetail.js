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

import CloseIcon from '@mui/icons-material/Close'
import { Box, IconButton, Paper, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import withLoader from '../../../../components/feedback/with-loader/WithLoader'
import UserSearch from '../../../../components/inputs/user-search/UserSearch'
import BackToListLink from '../../../../components/navigation/back-to-list-link/BackToListLink'
import JuralioTable from '../../../../components/table/JuralioTable'
import { getDateDisplayString } from '../../../../services/helpers/date-helper'
import {
  renderUserColumn,
  useUserColumnStyles,
} from '../../../../services/helpers/table/juralio-table-common-columns'
import { DATE_FORMAT_DAY_MONTH_YEAR } from '../../../constants'
import {
  generateClosedRow,
  generateOpenRow,
} from '../projects-table/creator-closer-row-helper'
import ProjectName from '../projects-table/ProjectName'
import ProjectStatusToggle from '../projects-table/ProjectStatusToggle'
import { teamData } from './workstream-table-helper'
import WorkstreamPrivateToggle from './WorkstreamPrivateToggle'

const useStyles = makeStyles()(theme => ({
  root: {
    paddingBottom: theme.spacing(2),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  workstreamWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '40%',
  },
  rowWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: theme.spacing(2),
  },
  rowLabel: {
    marginRight: theme.spacing(1),
  },
}))

const WorkstreamDetail = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  const userColumnClasses = useUserColumnStyles()
  const currentUser = useSelector(state => state.auth.data.details.username)

  const openClosedData = [
    [
      props.workstream.creator,
      getDateDisplayString(
        props.workstream.creationDate,
        DATE_FORMAT_DAY_MONTH_YEAR,
        true
      ),
      props.workstream.active,
    ],
    [
      props.workstream.closer,
      getDateDisplayString(
        props.workstream.closedDate,
        DATE_FORMAT_DAY_MONTH_YEAR,
        true
      ),
    ],
  ]

  const teamCols = [
    {
      field: 'user',
      headerName: t('entity.name'),
      flex: 2,
      filterable: false,
      sortable: false,
      renderCell: params =>
        renderUserColumn(
          t,
          userColumnClasses.classes,
          params.row.user,
          currentUser
        ),
      getApplyQuickFilterFn: filterVal => (value, row) =>
        row._search.includes(filterVal.toLowerCase()),
    },
    {
      field: 'remove',
      headerName: t('privateWorkstreamTeam.removeTableHeader'),
      flex: 1,
      filterable: false,
      sortable: false,
      renderCell: params => (
        <div style={{ textAlignLast: 'center' }}>
          <IconButton
            aria-label={t('common.delete')}
            data-test="delete-button"
            onClick={() =>
              props.removeMember(
                params.row._member.user.privateWorkstreamMemberId,
                params.row.user.id
              )
            }
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </div>
      ),
      getApplyQuickFilterFn: () => () => false,
    },
  ]

  const renderWorkstreamTab = () => (
    <div style={{ display: 'flex' }}>
      <Box className={classes.workstreamWrapper}>
        <Box className={classes.rowWrapper}>
          <Typography className={classes.rowLabel}>
            {t('workstreamDetails.name')}
          </Typography>
          <ProjectName
            project={props.workstream}
            mode={props.mode}
            matterId={props.matterId}
            actions={{
              updateProject: props.updateProject,
              clearErrorMessage: props.clearErrorMessage,
            }}
          />
        </Box>
        <Box className={classes.rowWrapper}>
          {props.workstream.active
            ? generateOpenRow(openClosedData, classes, t)
            : generateClosedRow(openClosedData, classes, t)}
        </Box>
        <Box className={classes.rowWrapper}>
          <Typography className={classes.rowLabel}>
            {t('workstreamDetails.status')}{' '}
          </Typography>
          <ProjectStatusToggle
            currentValue={props.workstream.active}
            readOnly={props.readOnly}
            updateStatus={() =>
              props
                .updateProject(props.matterId, props.workstream.id, {
                  active: !props.workstream.active,
                })
                .then(() => props.fetchMatterDetails(props.matterId, false))
            }
          />
        </Box>
        <Box className={classes.rowWrapper}>
          <Typography className={classes.rowLabel}>
            {t('workstreamDetails.visibility')}
          </Typography>
          <WorkstreamPrivateToggle
            currentValue={props.workstream.isPrivate}
            readOnly={props.readOnly}
            updateStatus={() =>
              props
                .updateProject(props.matterId, props.workstream.id, {
                  isPrivate: !props.workstream.isPrivate,
                })
                .then(() => {
                  props.fetchMatterDetails(props.matterId, false)
                  props.setSelectedWorkstreamIndex(null)
                })
            }
          />
        </Box>
      </Box>
      {renderPeopleTab()}
    </div>
  )

  const renderPeopleTab = () => {
    const availableUsers = props.matterTeam.filter(
      member =>
        !props.workstream.privateWorkstreamTeam
          .map(u => u.user.id)
          .includes(member.user.id) &&
        member.user.enabled &&
        (member.teamMemberId !== 0 || member.matterViewerId > 0)
    )
    return (
      <>
        <div
          style={{
            width: '60%',
            marginLeft: 'auto',
            paddingTop: '8px',
          }}
        >
          <Typography variant="h5">Restricted workstream members</Typography>

          {props.workstream?.privateWorkstreamTeam?.length > 0 && (
            <>
              <UserSearch
                currentTeam={props.workstream.privateWorkstreamTeam}
                availableUsers={availableUsers}
                onSelect={user => props.addMember(user)}
                handleRemoveUser={user =>
                  props.removeMember(user.privateWorkstreamMemberId, user.id)
                }
                showAvatarList={false}
                showIcon={availableUsers.length > 0}
                projectId={props.workstream.id}
                hideItemRole={true}
                noBreak={true}
                addText={t('addUsersDialog.dialogTitle')}
                isInPrivateWS={true}
                team={[]}
              />
              <div style={{ marginTop: '12px' }}>
                <JuralioTable
                  columns={teamCols}
                  rows={teamData(props.workstream.privateWorkstreamTeam)}
                  tableBodyHeight="500px"
                />
              </div>
            </>
          )}
          {props.workstream?.privateWorkstreamTeam?.length === 0 && (
            <>
              <Typography>{t('privateWorkstreamTeam.teamIsEmpty')}</Typography>
              <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                <UserSearch
                  className={classes.addPeopleButton}
                  currentTeam={props.workstream.privateWorkstreamTeam}
                  availableUsers={availableUsers}
                  onSelect={user => props.addMember(user)}
                  handleRemoveUser={user =>
                    props.removeMember(user.privateWorkstreamMemberId, user.id)
                  }
                  showAvatarList={false}
                  showIcon={availableUsers.length > 0}
                  projectId={props.workstream.id}
                  hideItemRole={true}
                  noBreak={true}
                  addText={t('addUsersDialog.dialogTitle')}
                  isInPrivateWS={true}
                  team={[]}
                />
              </div>
            </>
          )}
        </div>
      </>
    )
  }

  return (
    <Paper
      className={classes.root}
      style={{ padding: '24px' }}
      data-test="workstream-detail"
    >
      <BackToListLink
        actionHandler={() => props.setSelectedWorkstreamIndex(null)}
        linkText={t('workstreams.backToWorkstreamList')}
      />
      {renderWorkstreamTab()}
    </Paper>
  )
}

export default withLoader(200)(WorkstreamDetail)
