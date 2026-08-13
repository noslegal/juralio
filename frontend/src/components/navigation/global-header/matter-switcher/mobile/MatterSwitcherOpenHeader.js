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
import { Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../../../theme/juralio-colours'
import {
  MattersIcon,
  TemplatesIcon,
} from '../../../../../theme/navigation/CommonIcons'

const style = makeStyles()(theme => ({
  container: {
    width: '100%',
    height: theme.spacing(7),
    backgroundColor: juralioColours.named.beige[100],
    borderBottom: `1px solid ${juralioColours.control.border}`,
    display: 'flex',
  },
  tab: {
    display: 'flex',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
    borderRadius: `${theme.spacing(0.5)} ${theme.spacing(0.5)} 0px 0px`,
    cursor: 'pointer',
  },
  tabContainer: {
    width: '45%',
    display: 'flex',
    height: '100%',
    color: juralioColours.darkText.secondary,
  },
  tabIcon: {
    paddingRight: theme.spacing(1),
    height: theme.spacing(3),
    filter:
      'invert(36%) sepia(38%) saturate(231%) hue-rotate(166deg) brightness(98%) contrast(96%)',
  },
  matterTabOpen: {
    borderBottom: `3px solid ${juralioColours.theme.primary[500]}`,
  },
  templateTabOpen: {
    borderBottom: `3px solid ${juralioColours.theme.primary[500]}`,
  },
  closeIcon: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginRight: theme.spacing(0.5),
    fill: juralioColours.darkText.secondary,
    marginLeft: 'auto',
  },
}))

const MatterSwitcherOpenHeader = props => {
  const matterTabIsOpen = props.mattersOpen
  const { classes } = style()
  const { t } = useTranslation()

  return (
    <div className={classes.container}>
      <div
        className={`${classes.tabContainer} ${
          matterTabIsOpen && classes.matterTabOpen
        }`}
        onClick={() => {
          props.onMatterTabChange()
        }}
      >
        <div className={classes.tab} data-test="matter-switcher-matter-tab">
          <MattersIcon />
          <Typography variant="subtitle1">
            {t('navigationLinks.matters')}
          </Typography>
        </div>
      </div>
      <div
        className={`${classes.tabContainer} ${
          !matterTabIsOpen && classes.templateTabOpen
        }`}
        onClick={() => {
          props.onTemplateTabChange()
        }}
      >
        <div className={classes.tab} data-test="matter-switcher-template-tab">
          <TemplatesIcon className={classes.tabIcon} />
          <Typography variant="subtitle1">
            {t('navigationLinks.templates')}
          </Typography>
        </div>
      </div>
      <CloseIcon className={classes.closeIcon} onClick={props.closeSwitcher} />
    </div>
  )
}

export default MatterSwitcherOpenHeader
