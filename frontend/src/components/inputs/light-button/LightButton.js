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

import { Tooltip } from '@mui/material'
import Typography from '@mui/material/Typography'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import colourModifiers from '../../../theme/color-modifiers'
import rawColours from '../../../theme/raw-colours'

export const lightButtonBackgroundColour = colourModifiers.restingButtonOpacity(
  rawColours.primary.white.primary
)

export const lightButtonHoverColour = colourModifiers.hoverButtonOpacity(
  rawColours.primary.white.primary
)

const useStyles = makeStyles()(theme => ({
  root: {
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(0.5),
    paddingLeft: theme.spacing(0.75),
    paddingRight: theme.spacing(0.75),
    backgroundColor: lightButtonBackgroundColour,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    '&:hover': {
      opacity: '60%',
      cursor: 'pointer',
    },
    width: 'fit-content',
  },
  text: { color: colourModifiers.primaryText(rawColours.text.black) },
}))

const LightButton = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const {
    caption,
    startIcon,
    endIcon,
    width,
    clickHandler,
    isNotStarted,
    viewOnly,
    error,
  } = props
  const additionalStyle = {}

  if (width) {
    additionalStyle.width = width
  }
  if (isNotStarted) {
    additionalStyle.backgroundColor = colourModifiers.restingButtonOpacity(
      rawColours.primary.grey.main
    )
  }
  if (viewOnly) {
    additionalStyle.cursor = 'unset'
    additionalStyle.opacity = '100%'

    // additionalStyle.pointerEvents = 'none'
  }

  return (
    <Tooltip title={t('matter.viewOnly')} disableHoverListener={!viewOnly}>
      <div
        className={classes.root}
        style={additionalStyle}
        onClick={e => {
          !props.viewOnly && clickHandler(e)
        }}
        data-test={props['data-test']}
        id={props['id']}
      >
        {startIcon}
        <Typography
          style={{
            color: error ? 'rgb(176, 0, 32)' : '',
          }}
          className={classes.text}
          variant="caption"
        >
          {caption}
        </Typography>
        {endIcon}
      </div>
    </Tooltip>
  )
}

LightButton.propTypes = {
  caption: PropTypes.string.isRequired,
  /** clickHandler */
  clickHandler: PropTypes.func.isRequired,
  /** trackingId */
  trackingId: PropTypes.string,
  /** trackingValue */
  trackingValue: PropTypes.string,
  /** Optional content LHS of caption */
  startIcon: PropTypes.any,
  /** Optional content RHS of caption */
  endIcon: PropTypes.any,
  /** Optional set button width */
  width: PropTypes.number,
}

export default LightButton
