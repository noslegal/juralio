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

import { mdiArrowLeftCircle } from '@mdi/js'
import Icon from '@mdi/react'
import People from '@mui/icons-material/People'
import { Box, Button, Paper, Tab, Tabs, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import ClosedInfoBox from '../../../components/data-display/closed-info-box/ClosedInfoBox'
import {
  addAdmin,
  addEditor,
  addViewOnly,
} from '../../../redux/ducks/matter-team'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'
import rawColours from '../../../theme/raw-colours'
import { OPERATION_MODE } from '../../constants'
import PanelTitle from '../../organisation/users/panels/PanelTitle'
import AddUserFlowContainer from './AddUserFlowContainer'
import MatterPeopleTableContainer from './matter-people-table/MatterPeopleTableContainer'
import MatterPeopleHeading from './MatterPeopleHeading'
import AddPlaceholderButton from '../../../components/inputs/add-placeholder-button/AddPlaceholderButton'
import PlaceholderTableContainer from './placeholder-table/PlaceholderTableContainer'
import CreatePlaceholderDialog from '../placeholders/CreatePlaceholderDialog'
import placeholderService from '../../../services/placeholders/placeholder-service'
import MergePlaceholdersDialog from '../placeholders/MergePlaceholdersDialog'
import BigDataSpinner from '../../../components/feedback/big-data-spinner/BigDataSpinner'
import GroupPositionTable from './group-position-table/GroupPositionTable'
import { useSelector } from 'react-redux'

const useStyles = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(),
  },
  searchContainer: {
    height: theme.spacing(5),
  },
  textHelper: {
    display: 'flex',
    paddingLeft: theme.spacing(1.5),
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    marginLeft: theme.spacing(2),
    width: '30%',
    alignItems: 'center',
    backgroundColor: JuralioNamedColours.beige[100],
  },
  arrowIcon: {
    paddingRight: theme.spacing(1.5),
  },
  buttonWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(),
  },
  mergePlaceholdersButton: {
    height: theme.spacing(5),
    marginLeft: 'auto',
  },
  contentPaper: {
    padding: theme.spacing(3),
    borderRadius: 12,
  },
}))

const MatterPeople = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const { team, teamActions } = props
  const matterDetails = useSelector(state => state.matterDetails)
  const [placeholderData, setPlaceholderData] = useState([])
  const [placeholdersLoaded, setPlaceholdersLoaded] = useState(false)
  const [value, setValue] = useState(0)
  const [showAddPlaceholderDialog, setShowAddPlaceholderDialog] =
    useState(false)
  const [showMergePlaceholdersDialog, setshowMergePlaceholdersDialog] =
    useState(false)

  useEffect(() => {
    placeholderService
      .getPlaceholders(props.matter.id?.toString())
      .then(res => {
        if (res.status === 200) {
          setPlaceholderData(res.body)
        }
      })
  }, [props.matter])

  useEffect(() => {
    getPlaceholders()
  }, []) //eslint-disable-line

  const getPlaceholders = () => {
    setPlaceholdersLoaded(false)
    placeholderService
      .getPlaceholders(props.matter.id?.toString())
      .then(res => {
        setPlaceholderData(res.body)
        setPlaceholdersLoaded(true)
      })
  }

  const renderSearch = () => {
    return props.mode !== OPERATION_MODE.EDIT ? null : (
      <div className={classes.wrapper}>
        <div className={classes.searchContainer}>
          <AddUserFlowContainer
            selectedMatter={props.matter}
            matterTeam={team}
            addEditor={addEditor}
            addAdmin={addAdmin}
            addViewOnly={addViewOnly}
            assignAdminRoleInitialValue={false}
            assignEditorRoleInitialValue={true}
          />
        </div>
        {team.length < 2 && (
          <div className={classes.textHelper} data-test="team-helper">
            <Icon
              path={mdiArrowLeftCircle}
              size={1.5}
              color={rawColours.primary.primary.main}
              className={classes.arrowIcon}
            />
            <Typography>{t('teamMembership.helper')}</Typography>
          </div>
        )}
      </div>
    )
  }

  const onClickHandler = () => {
    if (showAddPlaceholderDialog) {
      setShowAddPlaceholderDialog(false)
    } else {
      setShowAddPlaceholderDialog(true)
    }
  }

  const handleCloseDialog = () => {
    setShowAddPlaceholderDialog(false)
  }

  const triggerMergePlaceholders = () => {
    setshowMergePlaceholdersDialog(true)
  }

  const panelTitle = {
    0: {
      header: t('matterAdmin.people.header'),
      caption: t('matterAdmin.people.subtitle'),
    },
    1: {
      header: t('matterAdmin.placeholders.header'),
      caption: t('matterAdmin.placeholders.description'),
    },
    2: {
      header: t('matterAdmin.people.groupPositionTable.tab'),
      caption: t('matterAdmin.people.groupPositionTable.description'),
    },
  }

  const mergePlaceholdersCallback = (fetch = false) => {
    if (fetch) {
      placeholderService
        .getPlaceholders(props.matter.id?.toString())
        .then(res => {
          if (res.status === 200) {
            setPlaceholderData(res.body)
          }
        })
    }
    setshowMergePlaceholdersDialog(false)
  }

  return (
    <Box style={{ width: '100%' }}>
      <Box style={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={(event, value) => setValue(value)}>
          <Tab label={t('matterAdmin.people.header')} value={0} />
          <Tab
            data-test="placeholders-tab"
            label={t('matterAdmin.placeholders.header')}
            value={1}
          />
          <Tab
            label={t('matterAdmin.people.groupPositionTable.tab')}
            data-test="group-positions-tab"
            value={2}
          />
        </Tabs>
      </Box>
      <Paper className={classes.contentPaper}>
        <PanelTitle
          icon={<People />}
          header={panelTitle[value].header}
          caption={panelTitle[value].caption}
        />
        {value === 0 && (
          <>
            <MatterPeopleHeading
              team={team}
              teamIsLoaded={props.teamIsLoaded}
            />
            {props.isClosed && (
              <ClosedInfoBox text={t('teamMembership.teamClosed')} />
            )}
            {renderSearch()}
            <MatterPeopleTableContainer
              currentUser={props.currentUser}
              people={team}
              matterId={props.matter.id?.toString()}
              mode={props.mode}
              teamActions={teamActions}
              teamIsLoaded={props.isLoaded}
              isClosed={props.isClosed}
              addMatterTeamMembersHandler={addEditor}
              addMatterAdminsHandler={addAdmin}
              addViewOnlyUsers={addViewOnly}
              matter={matterDetails.overview}
            />
          </>
        )}
        {value === 1 && (
          <>
            <div className={classes.buttonWrapper}>
              <AddPlaceholderButton onClickHandler={onClickHandler} />
              <Button
                variant="outlined"
                color="primary"
                className={classes.mergePlaceholdersButton}
                data-test="merge-placeholders-button"
                onClick={triggerMergePlaceholders}
                disabled={placeholderData.length < 2}
              >
                {t('matterAdmin.placeholders.merge')}
              </Button>
            </div>
            {showAddPlaceholderDialog && (
              <CreatePlaceholderDialog
                handleClose={handleCloseDialog}
                matterId={props.matter.id?.toString()}
                callBack={getPlaceholders}
                taskId={undefined}
              />
            )}
            {placeholdersLoaded && (
              <PlaceholderTableContainer
                matterId={props.matter.id?.toString()}
                mode={props.mode}
                placeholders={placeholderData}
                teamActions={teamActions}
                teamIsLoaded={placeholdersLoaded}
                isClosed={props.isClosed}
                callBack={getPlaceholders}
              />
            )}

            {showMergePlaceholdersDialog && placeholderData && (
              <MergePlaceholdersDialog
                callback={mergePlaceholdersCallback}
                placeholders={placeholderData}
                matterId={props.matter.id}
              />
            )}
            {!placeholdersLoaded && <BigDataSpinner size={80} />}
          </>
        )}
        {value === 2 && (
          <>
            <GroupPositionTable
              team={team}
              matterOverview={matterDetails.overview}
            />
          </>
        )}
      </Paper>
    </Box>
  )
}
export default MatterPeople
