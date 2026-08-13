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

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Button, Divider, List, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import { useNavigate } from 'react-router-dom'
import { withStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'
import { getMatterOverviewUrl } from '../../navigation/common/location-context-helper'
import LeftColumnListItem from './LeftColumnListItem'

const styles = theme => ({
  leftColumn: {
    flex: 1,
    minWidth: theme.spacing(42.375),
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    paddingBottom: theme.spacing(11),
  },
  titleWrapper: {
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(2),
  },
  title: {
    color: juralioColours.darkText.secondary,
  },
  titleWithLogo: {
    marginTop: theme.spacing(1),
    color: juralioColours.darkText.secondary,
    display: 'flex',
  },
  caption: {
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(1),
    width: '80%',
    color: juralioColours.darkText.secondary,
  },
  padding: {
    paddingTop: theme.spacing(2),
  },
  line: {
    marginTop: theme.spacing(3),
    borderBottom: `4px solid ${theme.palette.background.default}`,
  },
  list: {
    padding: 0,
    height: '100%',
    paddingBottom: theme.spacing(12.5),
  },
  goToOverviewButton: {
    marginTop: theme.spacing(4),
    marginLeft: theme.spacing(1),
    display: 'flex',
    color: JuralioNamedColours.blue.main,
    justifyContent: 'left',
    width: 'fit-content',
    textTransform: 'none',
  },
  buttonIcon: {
    marginLeft: theme.spacing(1),
  },
})

const TwoColumnList = props => {
  const { t } = useTranslation()
  const history = useNavigate()
  const location = useLocation()
  const userAuthData = useSelector(state => state.auth.data.auth)
  const team = useSelector(state => state.matterTeam.mainPage.team)
  const { listItems, selectedListItem, selectItem } = props
  const firstItem = listItems[Object.keys(listItems)[0]]
  const hasTitle = () => firstItem.prompt?.length > 0
  const hasSubtitle = () => firstItem.caption?.length > 0
  const isMatterAdminLocation = location.pathname.includes('matteradmin')

  const isEditor =
    team
      .filter(t => t.teamMemberId)
      .map(x => x.user)
      .filter(user => user.username === userAuthData.username).length !== 0

  const isMatterViewer =
    team
      .filter(t => t.matterViewerId)
      .map(x => x.user)
      .filter(user => user.username === userAuthData.username).length !== 0

  const seeOverviewbutton =
    firstItem.matter?.projects.filter(
      p => p.active && (p.isPrivateMember || !p.isPrivate)
    ).length > 0

  const showMatterOverviewLink =
    (isEditor || isMatterViewer) &&
    isMatterAdminLocation &&
    seeOverviewbutton &&
    firstItem.matter.matterStatus !== 'closed' &&
    firstItem.matter.activeWorkstreams > 0

  return (
    <div className={props.classes.leftColumn}>
      {showMatterOverviewLink && (
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon className={props.classes.buttonIcon} />}
          data-test="go-to-matter-overview"
          onClick={() => history(getMatterOverviewUrl(firstItem.matter.id))}
          className={props.classes.goToOverviewButton}
          size="small"
        >
          <Typography variant="caption">
            {t('matterSelector.goToMatterOverview')}
          </Typography>
        </Button>
      )}
      {hasTitle() && (
        <div className={props.classes.titleWrapper}>
          {firstItem.logo}
          <Typography
            variant="h5"
            className={
              firstItem.logo ? props.classes.titleWithLogo : props.classes.title
            }
            data-test="left-column-header"
          >
            {firstItem.prompt}
          </Typography>
        </div>
      )}
      {hasSubtitle() && (
        <Typography
          variant="caption"
          className={props.classes.caption}
          data-test="left-column-subheader"
        >
          {firstItem.caption}
        </Typography>
      )}
      {!hasTitle() && !hasSubtitle() && (
        <div className={props.classes.padding} />
      )}

      <div className={props.classes.line} />
      <List className={props.classes.list}>
        {Object.entries(listItems).map(item => (
          <React.Fragment key={item[1].header}>
            <LeftColumnListItem
              selectionResetHandler={item[1].selectionResetHandler}
              dataTest={item[1].dataTest}
              selectItem={selectItem}
              itemKey={item[0]}
              icon={item[1].icon}
              header={item[1].header}
              subtitle={item[1].subtitle}
              isSelected={item[0] === selectedListItem}
            />
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  )
}

export default withStyles(TwoColumnList, styles)
