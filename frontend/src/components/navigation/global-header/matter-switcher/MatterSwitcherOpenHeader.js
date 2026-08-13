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
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../../theme/juralio-colours'
import {
  MattersIcon,
  TemplatesIcon,
} from '../../../../theme/navigation/CommonIcons'

const MATTER = 'matter'
const TEMPLATE = 'template'

const style = makeStyles()(theme => ({
  container: {
    width: theme.spacing(45),
    height: theme.spacing(7),
    backgroundColor: juralioColours.matterSwitcher.matterHeader.nonSelectedTab,
    borderRadius: `${theme.spacing(0.5)} ${theme.spacing(0.5)} 0px 0px`,
    display: 'flex',
    cursor: 'pointer',
  },
  externalContainer: {
    width: theme.spacing(22.5),
    height: theme.spacing(7),
    backgroundColor: juralioColours.matterSwitcher.matterHeader.nonSelectedTab,
    borderRadius: `${theme.spacing(0.5)} ${theme.spacing(0.5)} 0px 0px`,
    display: 'flex',
    cursor: 'pointer',
    clipPath: 'polygon(0 0, 83% 0, 100% 100%, 0% 100%)',
  },
  containerHoverOverUnselectedTab: {
    backgroundColor:
      juralioColours.matterSwitcher.matterHeader.hoverTabBackground,
  },
  tab: {
    display: 'flex',
    marginLeft: theme.spacing(3.25),
    marginRight: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
    borderRadius: `${theme.spacing(0.5)} ${theme.spacing(0.5)} 0px 0px`,
    cursor: 'pointer',
  },
  tabContainer: {
    width: theme.spacing(22.5),
    display: 'flex',
    height: '100%',
    color: juralioColours.darkText.secondary,
  },
  tabIcon: {
    paddingRight: theme.spacing(1),
    filter:
      'invert(36%) sepia(38%) saturate(231%) hue-rotate(166deg) brightness(98%) contrast(96%)',
  },
  matterTabOpen: {
    background: 'white',
    clipPath: 'polygon(0 0, 83% 0, 100% 100%, 0% 100%)',
    borderRadius: `${theme.spacing(0.5)} ${theme.spacing(0.5)} 0px 0px`,
    color: `${juralioColours.matterSwitcher.matterHeader.selectedTabTextColour} !important`,
  },
  templateTabOpen: {
    background: 'white',
    clipPath: ' polygon(13% 0%, 100% 0, 100% 100%, 0% 100%)',
    borderRadius: `${theme.spacing(0.5)} ${theme.spacing(0.5)} 0px 0px`,
    color: juralioColours.matterSwitcher.matterHeader.selectedTabTextColour,
  },
}))

const MatterSwitcherOpenHeader = props => {
  const matterTabIsOpen = props.mattersOpen
  const [hoveringOver, setHoveringOver] = useState(null)
  const { classes } = style()
  const { t } = useTranslation()

  const handleMouseEnter = type => {
    setHoveringOver(type)
  }

  const handleMouseLeave = () => {
    setHoveringOver(null)
  }

  const showHover =
    (matterTabIsOpen && hoveringOver === TEMPLATE) ||
    (!matterTabIsOpen && hoveringOver === MATTER)

  return (
    <div
      className={`${
        props.isExternal ? classes.externalContainer : classes.container
      } ${showHover && classes.containerHoverOverUnselectedTab}`}
      onClick={e => e.stopPropagation()}
    >
      <div
        className={`${classes.tabContainer} ${
          matterTabIsOpen && classes.matterTabOpen
        }`}
        onClick={props.onMatterTabChange}
        onMouseEnter={() => handleMouseEnter(MATTER)}
        onMouseLeave={handleMouseLeave}
      >
        <div className={classes.tab} data-test="matter-switcher-matter-tab">
          <MattersIcon />
          <Typography variant="h6">{t('navigationLinks.matters')}</Typography>
        </div>
      </div>
      {!props.isExternal && (
        <div
          onClick={props.onTemplateTabChange}
          className={`${classes.tabContainer} ${
            !matterTabIsOpen && classes.templateTabOpen
          }`}
          onMouseEnter={() => handleMouseEnter(TEMPLATE)}
          onMouseLeave={handleMouseLeave}
        >
          <div className={classes.tab} data-test="matter-switcher-template-tab">
            <TemplatesIcon className={classes.tabIcon} fontSize="medium" />
            <Typography variant="h6">
              {t('navigationLinks.templates')}
            </Typography>
          </div>
        </div>
      )}
    </div>
  )
}

export default MatterSwitcherOpenHeader
