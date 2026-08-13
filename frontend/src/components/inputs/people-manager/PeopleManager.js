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

import { Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import { makeStyles } from 'tss-react/mui'
import CreatePlaceholderDialog from '../../../app/matter-details/placeholders/CreatePlaceholderDialog'
import UsersControlContainer from '../../../app/users/UsersControlContainer'
import { formatUserDisplayNameAndUserName } from '../../../services/user/helper/user-format-service'
import colorModifiers from '../../../theme/color-modifiers'
import { PeopleIcon } from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'
import UserList from '../../layouts/user-list/UserList'
import { getMatterIdFromLocation } from '../../navigation/common/location-context-helper'
import PopUpMenu from '../../surfaces/pop-up-menu/PopUpMenu'
import AddPeopleButton from '../add-people-button/AddPeopleButton.js'
import TeamSearch from '../team-search/TeamSearch'

const useStyles = makeStyles()(theme => ({
  root: {},
  topRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listHeader: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(1),
    paddingTop: theme.spacing(1),
  },
  icon: {
    color: colorModifiers.primaryText(rawColours.primary.black[200]),
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  popUpMenu: {
    width: theme.spacing(42),
  },
}))

const PeopleManager = props => {
  const {
    people,
    matterId,
    isReadOnly,
    onClickAddPerson,
    onClickDeletePerson,
    addablePeople,
    canRemoveSelf,
    searchPlaceHolder,
    dataTestPrefix,
  } = props

  const { classes } = useStyles()
  const { t } = useTranslation()
  const [show, setShow] = useState(false)
  const location = useLocation()
  const [showPlaceholderDialog, setShowPlaceholderDialog] = useState(false)
  const [prefillValue, setPrefillValue] = useState('')
  const taskId = useSelector(state => state.selectedTask.id)

  window.addEventListener('show-placeholder-create-dialog', e => {
    setPrefillValue(e.detail.name)
    setShowPlaceholderDialog(true)
  })

  const renderUsersList = () => {
    return (
      <>
        <div className={classes.listHeader}>
          <PeopleIcon className={classes.icon} />
          <Typography variant="body2">
            {dataTestPrefix === 'meeting-note-people'
              ? t('postDetails.meetingNote.peopleTitle')
              : t('postDetails.editorsTitle')}
          </Typography>
        </div>
        <UserList
          users={people}
          onRemoveClick={
            !isReadOnly || props.isMatterAdmin ? onClickDeletePerson : null
          }
          canRemoveSelf={canRemoveSelf}
          viewOnly={isReadOnly && !props.isMatterAdmin}
        />
      </>
    )
  }

  return (
    <div
      className={classes.root}
      data-test={`${dataTestPrefix}-people-manager`}
    >
      <div className={classes.topRow}>
        <UsersControlContainer
          users={people}
          renderUsersList={() => renderUsersList()}
          floatLeft={false}
          showAvatarList={true}
        />
        {!props.viewOnly &&
          (addablePeople.length > 0 || props.showPlaceholders) && (
            <AddPeopleButton
              onClickHandler={() => setShow(!show)}
              dataTestPrefix={dataTestPrefix}
            />
          )}
      </div>
      {showPlaceholderDialog && props.showPlaceholders && (
        <CreatePlaceholderDialog
          handleClose={() => {
            setShowPlaceholderDialog(false)
          }}
          matterId={getMatterIdFromLocation(location)}
          taskId={taskId}
          callBack={() => {}}
          prefillValue={prefillValue}
        />
      )}
      {show && (
        <PopUpMenu
          onClick={() => setShow(!show)}
          onCloseClick={() => setShow(false)}
          customCss={classes.popUpMenu}
        >
          <div>
            <TeamSearch
              team={people} // people to exclude
              onChange={onClickAddPerson}
              matterId={`${matterId}`}
              filterHidden={true}
              placeholder={searchPlaceHolder}
              style={{
                paddingTop: '16px',
                paddingLeft: '16px',
                paddingRight: '16px',
              }}
              showPlaceholders={props.showPlaceholders}
              showPlaceholderAdd={props.showPlaceholders}
              onClose={() => setShow(false)}
              menuStyle={{}}
              disabled={false}
              showNoResults={true}
            />
            <UserList
              users={addablePeople}
              matterContext={true}
              postContext={true}
              selectable={true}
              onSelect={onClickAddPerson}
              formatUserDisplayName={formatUserDisplayNameAndUserName}
              onRemoveClick={null}
              canRemoveSelf={true}
            />
          </div>
        </PopUpMenu>
      )}
    </div>
  )
}

PeopleManager.propTypes = {
  dataTestPrefix: PropTypes.string,
}

export default PeopleManager
