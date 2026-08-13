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

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import withRouter from '../../../../services/navigation/WithRouter'
import rawColours from '../../../../theme/raw-colours'

const style = makeStyles()(() => ({
  buttonStyling: {
    color: rawColours.primary.grey[200],
    backgroundColor: rawColours.primary.black,
    '&:hover': {
      backgroundColor: rawColours.primary.black[200],
    },
    zIndex: '101',
    width: '100%',
    height: '100%',
    borderRight: 'solid',
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
    display: 'inline-flex',
    cursor: 'pointer',
    paddingLeft: '8px',
  },
}))

const MatterSwitcherHeaderButton = props => {
  const { t } = useTranslation()
  const { classes } = style()

  const defaultTitle = () => (
    <>
      <div
        onClick={props.handleClick}
        className={classes.buttonStyling}
        data-test="matter-switcher-button"
        id="matter-switcher-button"
      >
        <Typography>{t('navigationLinks.matters')}</Typography>
        <ArrowDropDownIcon />
      </div>
    </>
  )

  return defaultTitle()
}

export default withRouter(MatterSwitcherHeaderButton)
