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

import AddIcon from '@mui/icons-material/Add'
import { Typography } from '@mui/material'
import Button from '@mui/material/Button'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'

import juralioColours from '../../../theme/juralio-colours'
const styles = makeStyles()(theme => ({
  buttonTitleContainer: {
    paddingLeft: theme.spacing(1),
    overflow: 'hidden',
    cursor: 'pointer',
  },
  icon: {
    border: `2px solid ${juralioColours.control.borderLight}`,
    borderRadius: 5,
    color: juralioColours.darkText.secondary,
    fontSize: 'large',
  },
  iconHovered: {
    border: '2px solid black',
    borderRadius: 5,
    color: juralioColours.darkText.primary,
    fontSize: 'large',
  },
  button: {
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(6),
    width: 372,
    height: 64,
    borderStyle: 'dashed',
    borderWidth: 2,
    color: juralioColours.darkText.disabled,
    textTransform: 'none',
  },
  buttonHovered: {
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(6),
    width: 372,
    height: 64,
    borderStyle: 'dashed',
    borderWidth: 2,
    color: juralioColours.darkText.secondary,
    textTransform: 'none',
    backgroundColor: 'transparent !important',
  },
  title: {
    color: juralioColours.darkText.secondary,
  },
  titleHovered: {
    color: juralioColours.darkText.primary,
  },
}))
const ZeroStateCreateButton = props => {
  const { classes } = styles()
  const [isHovered, setIsHovered] = useState(false)

  const mouseEnter = () => {
    setIsHovered(true)
  }

  const mouseLeave = () => {
    setIsHovered(false)
  }

  const handleClick = () => {
    props.createFirstTask()
  }

  const { t } = useTranslation()
  return (
    <>
      <Button
        className={!isHovered ? classes.button : classes.buttonHovered}
        onMouseEnter={mouseEnter}
        onMouseLeave={mouseLeave}
        onClick={handleClick}
        data-test="taskmap-zero-state-button"
      >
        <AddIcon className={!isHovered ? classes.icon : classes.iconHovered} />
        <div className={classes.buttonTitleContainer}>
          <Typography
            className={!isHovered ? classes.title : classes.titleHovered}
            variant="subtitle1"
          >
            {t('taskmapZeroState.buttonTitle')}
          </Typography>
        </div>
      </Button>
    </>
  )
}
export default ZeroStateCreateButton //withTranslation()(withStyles(ZeroStateCreateButton, styles))
