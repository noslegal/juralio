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
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import { levelNumberToLetter } from '../../../services/helpers/task/task-util-helper'
import juralioColours from '../../../theme/juralio-colours'
import { TASK_PATH_HEIGHT } from './LevelIndicator'

export const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
  },
  levelLetter: {
    textTransform: 'capitalize !important',
    color: `${juralioColours.whiteText.primary} !important`,
    height: '100%',
    paddingLeft: '6px',
    paddingRight: '1px',
    display: 'flex',
    alignItems: 'center',
  },
  leadingTriangle: {
    borderStyle: 'solid',
    borderWidth: `20px 0 20px ${TASK_PATH_HEIGHT / 2}px`,
    borderColor: 'transparent transparent transparent #FF0000',
    marginRight: -4,
  },
  topTriangle: {
    position: 'absolute',
    top: -TASK_PATH_HEIGHT / 2,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: `0 8px ${TASK_PATH_HEIGHT / 2}px 0`,
    borderColor: 'transparent #FF0000 transparent transparent',
  },
  bottomTriangle: {
    position: 'absolute',
    bottom: -TASK_PATH_HEIGHT / 2,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: `0 0 ${TASK_PATH_HEIGHT / 2}px 8px`,
    borderColor: 'transparent transparent #FF0000 transparent',
  },
  triangleContainer: {
    width: 8,
    position: 'relative',
  },
}))

export const ARROW_TYPE = {
  LEFT_FLAT_RIGHT_POINTY: 'LEFT_FLAT_RIGHT_POINTY',
  LEFT_POINTY_RIGHT_FLAT: 'LEFT_POINTY_RIGHT_FLAT',
  LEFT_POINTY_RIGHT_POINTY: 'LEFT_POINTY_RIGHT_POINTY',
  LEFT_FLAT_RIGHT_FLAT: 'LEFT_FLAT_RIGHT_FLAT',
  LEFT_FLAT_RIGHT_POINTY_NO_LETTER: 'LEFT_FLAT_RIGHT_POINTY_NO_LETTER',
  LEFT_POINTY_RIGHT_POINTY_NO_LETTER: 'LEFT_POINTY_RIGHT_POINTY_NO_LETTER',
  LEFT_POINTY_RIGHT_POINTY_NO_LETTER_NO_LEADING_ARROW:
    'LEFT_POINTY_RIGHT_POINTY_NO_LETTER_NO_LEADING_ARROW',
}

const Arrow = props => {
  const { arrowType, arrowColour, levelNumber } = props
  const { classes } = useStyles()

  const renderArrowTail = arrowColour => (
    <div className={classes.triangleContainer}>
      <div
        className={classes.topTriangle}
        style={{
          borderColor: `transparent ${arrowColour} transparent transparent`,
        }}
      />
      <div
        className={classes.bottomTriangle}
        style={{
          borderColor: `transparent transparent ${arrowColour} transparent`,
        }}
      />
    </div>
  )

  const calcBorderRadius = () => {
    if (arrowType === ARROW_TYPE.LEFT_POINTY_RIGHT_FLAT) {
      return '0 4px 4px 0'
    } else if (arrowType === ARROW_TYPE.LEFT_FLAT_RIGHT_FLAT) {
      return '2px 4px 4px 2px'
    } else if (arrowType === ARROW_TYPE.LEFT_FLAT_RIGHT_POINTY) {
      return '2px 0 0 2px'
    }

    return '0'
  }

  const renderLevelLetter = levelNumber => (
    <Typography
      className={classes.levelLetter}
      style={{
        zIndex: 2,
        backgroundColor: arrowColour,
        paddingRight:
          arrowType === ARROW_TYPE.LEFT_POINTY_RIGHT_FLAT ||
          arrowType === ARROW_TYPE.LEFT_FLAT_RIGHT_FLAT
            ? '8px'
            : '2px',
        borderRadius: calcBorderRadius(),
      }}
    >
      {levelNumber ? levelNumberToLetter(levelNumber) : ''}
    </Typography>
  )

  const renderArrowHead = () => (
    <div
      className={classes.leadingTriangle}
      style={{
        borderColor: `transparent transparent transparent ${arrowColour}`,
      }}
    />
  )

  const renderArrow = () => {
    switch (arrowType) {
      case ARROW_TYPE.LEFT_FLAT_RIGHT_POINTY:
        return (
          <>
            {renderLevelLetter(levelNumber)}
            {renderArrowHead()}
          </>
        )
      case ARROW_TYPE.LEFT_POINTY_RIGHT_FLAT:
        return (
          <>
            {renderArrowTail(arrowColour)}
            {renderLevelLetter(levelNumber)}
          </>
        )
      case ARROW_TYPE.LEFT_POINTY_RIGHT_POINTY:
        return (
          <>
            {renderArrowTail(arrowColour)}
            {renderLevelLetter(levelNumber)}
            {renderArrowHead()}
          </>
        )
      case ARROW_TYPE.LEFT_FLAT_RIGHT_FLAT:
        return <>{renderLevelLetter(levelNumber)}</>
      case ARROW_TYPE.LEFT_FLAT_RIGHT_POINTY_NO_LETTER:
        return (
          <>
            {renderLevelLetter()}
            {renderArrowHead()}
          </>
        )
      case ARROW_TYPE.LEFT_POINTY_RIGHT_POINTY_NO_LETTER:
        return (
          <>
            {renderArrowTail(arrowColour)}
            {renderArrowHead()}
          </>
        )
      case ARROW_TYPE.LEFT_POINTY_RIGHT_POINTY_NO_LETTER_NO_LEADING_ARROW:
        return (
          <>
            {renderArrowTail(arrowColour)}
            {renderArrowHead()}
          </>
        )
      default:
        return null
    }
  }

  return <div className={classNames(classes.root)}>{renderArrow()}</div>
}

Arrow.propTypes = {
  arrowType: PropTypes.oneOf([
    ARROW_TYPE.LEFT_FLAT_RIGHT_POINTY,
    ARROW_TYPE.LEFT_POINTY_RIGHT_FLAT,
    ARROW_TYPE.LEFT_POINTY_RIGHT_POINTY,
    ARROW_TYPE.LEFT_FLAT_RIGHT_FLAT,
    ARROW_TYPE.LEFT_FLAT_RIGHT_POINTY_NO_LETTER,
    ARROW_TYPE.LEFT_POINTY_RIGHT_POINTY_NO_LETTER,
    ARROW_TYPE.LEFT_POINTY_RIGHT_POINTY_NO_LETTER_NO_LEADING_ARROW,
  ]),
  levelNumber: PropTypes.number,
}

export default Arrow
