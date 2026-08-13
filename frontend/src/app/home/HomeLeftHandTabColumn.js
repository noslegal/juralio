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
import { IconButton, Paper, Tab, Tabs } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import colorModifiers from '../../theme/color-modifiers'
import rawColours from '../../theme/raw-colours'
import TodoAndRecentContainer from './TodoAndRecentContainer'

const style = makeStyles()(theme => ({
  wrapper: {
    width: theme.spacing(60),
    marginTop: theme.spacing(2),
    background: colorModifiers.secondaryBackground(
      rawColours.primary.white.primary
    ),
  },
  mobileWrapper: {
    background: colorModifiers.secondaryBackground(
      rawColours.primary.white.primary
    ),
    height: '100%',
    paddingBottom: theme.spacing(11),
  },
  tabs: {
    background: rawColours.primary.white.primary,
    width: '100%',
  },
  tabsMobile: {
    background: rawColours.primary.white.primary,
    width: `calc(100% -  ${theme.spacing(2.5)})`,
  },
  tab: {
    width: '50%',
    '&.Mui-selected': {
      color: rawColours.primary.primary.main,
    },
  },
  tabsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    background: rawColours.primary.white.primary,
    width: '100%',
  },
  closeButton: {
    width: theme.spacing(2.5),
    marginRight: theme.spacing(),
  },
}))

const tabStyle = {
  style: { background: rawColours.primary.primary.main },
}

const HomeLeftHandTabColumn = props => {
  const { classes } = style()
  const { t } = useTranslation()

  const [selectedTab, setSelectedTab] = useState(
    parseInt(window.sessionStorage.getItem('juralioHomePageTabSelection')) || 0
  )

  const handleTabChange = (e, newValue) => {
    window.sessionStorage.setItem('juralioHomePageTabSelection', newValue)
    setSelectedTab(newValue)
  }

  return (
    <Paper
      className={props.mobile ? classes.mobileWrapper : classes.wrapper}
      data-test="home-left-hand-column"
      elevation={0}
    >
      <div className={classes.tabsWrapper}>
        <Tabs
          className={props.mobile ? classes.tabsMobile : classes.tabs}
          value={selectedTab}
          onChange={handleTabChange}
          indicatorColor={'primary'}
          slotProps={{
            indicator: tabStyle,
          }}
        >
          <Tab
            className={classes.tab}
            label={t('home.tabs.todo')}
            data-test="home-todo-tab"
          />
          <Tab
            className={classes.tab}
            label={t('home.tabs.recentlyViewed')}
            data-test="home-recently-viewed-tab"
          />
        </Tabs>
        {props.mobile && (
          <IconButton
            className={classes.closeButton}
            onClick={props.mobileClose}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        )}
      </div>
      <TodoAndRecentContainer selectedTab={selectedTab} />
    </Paper>
  )
}

export default HomeLeftHandTabColumn
