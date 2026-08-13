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

import { Paper, Typography, useMediaQuery } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import {
  generateTipImageByName,
  getTipById,
  isTipCardNew,
} from '../../../components/ftue/tip-card-content'
import juralioTheme from '../../../theme/juralio-theme'
import ClosableMasonryItem from './ClosableMasonryItem'

const style = makeStyles()(theme => ({
  content: {
    height: 'fit-content',
  },
  column: {
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
  },
  titleRow: {
    backgroundColor: 'white',
    height: theme.spacing(4),
    borderTopRightRadius: theme.spacing(4),
    borderBottomRightRadius: theme.spacing(4),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(),
    display: 'flex',
    alignItems: 'center',
  },
  descriptionText: {
    color: 'white',
    fontSize: theme.spacing(2),
  },
  titleText: {
    marginLeft: theme.spacing(2),
    fontSize: theme.spacing(2),
    fontWeight: '600',
  },
  description: {
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  imageWrapper: {
    backgroundColor: 'white',
    borderRadius: theme.spacing(2),
    height: theme.spacing(11.625),
    width: theme.spacing(11.625),
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
  },
  ribbon: {
    position: 'absolute',
    background: '#C23B22',
    color: 'white',
    overflow: 'hidden',
    width: '100px',
    top: '10px',
    right: '-25px',
    transform: 'rotate(45deg)',
    display: 'flex',
    justifyContent: 'center',
    zIndex: 1,
  },
}))

const TipMasonry = props => {
  const { classes } = style()
  const { t } = useTranslation()
  const [isHovering, setIsHovering] = useState(false)
  const [tip, setTip] = useState(
    props.tip ? props.tip : getTipById(t, props.tipId)
  )
  const [mobileSwipeStart, setMobileSwipeStart] = useState(0)
  const [mobileSwipeEnd, setMobileSwipeEnd] = useState(0)
  const isMobileView =
    useMediaQuery(juralioTheme.breakpoints.down('md')) || !props.showInteraction

  useEffect(() => {
    let hideTips = window.sessionStorage.getItem('hideTips')
    if (hideTips != null) {
      setTip(null)
    }
  }, [])

  const closeTip = () => {
    window.sessionStorage.setItem('hideTips', true)
    setTimeout(() => {
      setTip(null)
      props.resizeMasonry()
    }, 100)
  }

  if (tip === null) {
    return null
  }

  const handleTouchStart = e => {
    setMobileSwipeStart(e.targetTouches[0].clientX)
  }
  const handleTouchMove = e => {
    setMobileSwipeEnd(e.targetTouches[0].clientX)
  }
  const handleTouchEnd = () => {
    if (Math.abs(mobileSwipeStart - mobileSwipeEnd) > 150) {
      setIsHovering(true)
    }
  }

  const handleMasonryClick = () => {
    if (isMobileView) {
      setIsHovering(!isHovering)
    }
  }

  return (
    // 'Class'es required for layout.
    <div data-test="masonry-item" class="item">
      <div className={classes.content} class="content" data-test="tip-card">
        <Paper
          onMouseEnter={() => {
            if (!isMobileView) {
              setIsHovering(true)
            }
          }}
          onMouseLeave={() => {
            if (!isMobileView) {
              setIsHovering(false)
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleMasonryClick}
        >
          <ClosableMasonryItem
            isHovering={isHovering && props.showInteraction}
            dataTest={'tip'}
            closeTip={props.showInteraction ? closeTip : () => {}}
            backgroundColour={props.colour}
            content={
              <>
                {isTipCardNew(tip.name) && (
                  <div className={classes.ribbon}>
                    <Typography>New!</Typography>
                  </div>
                )}

                <div
                  className={classes.column}
                  style={{ width: 'calc(100% - 32px)' }}
                >
                  <div className={classes.titleRow}>
                    <Typography
                      style={{ color: props.colour }}
                      className={classes.titleText}
                    >
                      {tip.title}
                    </Typography>
                  </div>
                  <div className={classes.description}>
                    <Typography className={classes.descriptionText}>
                      {tip.description}
                    </Typography>
                  </div>
                </div>
                <div className={classes.column}>
                  <div className={classes.imageWrapper}>
                    {generateTipImageByName(tip.name)}
                  </div>
                </div>
              </>
            }
          />
        </Paper>
      </div>
    </div>
  )
}

export default TipMasonry
