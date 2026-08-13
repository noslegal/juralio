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

import DeleteIcon from '@mui/icons-material/Delete'
import InfoIcon from '@mui/icons-material/Info'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import { Button, Card, IconButton, Tooltip, Typography } from '@mui/material'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import zeroStateImage from '../../../assets/images/inbox-overview.svg'
import juralioColours from '../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: theme.spacing(40),
    height: theme.spacing(38),
  },
  unavailable: {
    backgroundColor: juralioColours.iconDisabled,
  },
  topBar: {
    paddingTop: theme.spacing(1.5),
    paddingLeft: theme.spacing(1.5),
    display: 'flex',
    alignItems: 'center',
  },
  featuredButton: {
    color: juralioColours.whiteText.primary,
  },
  featureButton: {
    color: juralioColours.theme.primary.main,
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: theme.spacing(30),
  },
  image: {
    width: theme.spacing(18),
    height: theme.spacing(18),
  },
  infoToolTip: {
    display: 'flex',
  },
  infoIcon: {
    paddingLeft: theme.spacing(1.5),
    color: juralioColours.darkText.secondary,
  },
  deleteButton: {
    marginLeft: theme.spacing(13),
  },
  overflowText: {
    width: theme.spacing(36),
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
  },
  title: {
    color: juralioColours.darkText.primary,
  },
  subtitle: {
    color: juralioColours.darkText.secondary,
  },
}))

// The Slide handles display of a card with an image, text and buttons to
// feature, delete, etc the item. Look at the Noticeboard for an example.
const Slide = props => {
  const {
    title,
    subtitle,
    image,
    buttonText,
    handleButtonClick,
    iconTooltipText,
    handleIconClick,
    buttonHighlighted,
    unavailableTooltipText,
    unavailable,
  } = props
  const { classes } = useStyles()
  const { t } = useTranslation()
  const [, setVariant] = useState('outlined')

  useEffect(() => {
    setVariant(buttonHighlighted ? 'contained' : 'outlined')
  }, [buttonHighlighted])

  // Early bail out if key data not available.
  if (!props.title || !props.subtitle) return null

  const chooseImgSrc = () => {
    if (image) {
      return image
    } else {
      return zeroStateImage
    }
  }

  return (
    <Card
      variant="outlined"
      className={classNames(
        classes.root,
        unavailable ? classes.unavailable : ''
      )}
    >
      <div className={classes.topBar}>
        {buttonText && handleButtonClick && (
          <Button
            className={
              buttonHighlighted ? classes.featuredButton : classes.featureButton
            }
            variant={buttonHighlighted ? 'contained' : 'outlined'}
            color="primary"
            disableElevation
            startIcon={
              buttonHighlighted ? (
                <StarIcon className={classes.addIcon} />
              ) : (
                <StarBorderIcon className={classes.addIcon} />
              )
            }
            onClick={() => handleButtonClick()}
            data-test="slide-button"
          >
            {buttonText}
          </Button>
        )}
        {iconTooltipText && (
          <Typography
            className={classes.text}
            data-test="slide-icon-tooltip-text"
            variant="body2"
          >
            <Tooltip className={classes.infoToolTip} title={iconTooltipText}>
              <InfoIcon fontSize="small" className={classes.infoIcon} />
            </Tooltip>
          </Typography>
        )}
        {handleIconClick && (
          <IconButton
            data-test="slide-icon-button"
            className={classes.deleteButton}
            onClick={() => handleIconClick()}
            size="large"
          >
            <DeleteIcon />
          </IconButton>
        )}
      </div>
      <div className={classes.mainContent}>
        <Tooltip
          title={unavailable ? unavailableTooltipText : ''}
          placement="right"
        >
          <img
            src={chooseImgSrc()}
            className={classes.image}
            data-test="slide-image"
            alt={t('slide.alt')}
          />
        </Tooltip>
        <Typography
          color="textSecondary"
          variant="h5"
          data-test="slide-title"
          className={classNames(classes.overflowText, classes.title)}
        >
          {title}
        </Typography>
        <Typography
          color="textSecondary"
          variant="body1"
          data-test="slide-subtitle"
          className={classNames(classes.overflowText, classes.subtitle)}
        >
          {subtitle}
        </Typography>
      </div>
    </Card>
  )
}

Slide.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  buttonText: PropTypes.string, // e.g. Feature a notice
  handleButtonClick: PropTypes.func, // e.g. Feature a notice
  iconTooltipText: PropTypes.string, // Info icon
  handleIconClick: PropTypes.func, // e.g. Delete a notice
  buttonHighlighted: PropTypes.bool, // Styling
  unavailableTooltipText: PropTypes.string,
  unavailable: PropTypes.bool, // Styling. When true, makes the Slide look disabled
  image: PropTypes.string, // svg data. Component will display a zero state image if image not supplied
}

export default Slide
