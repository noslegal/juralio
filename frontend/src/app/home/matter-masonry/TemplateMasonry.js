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

import { Paper, useMediaQuery } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { makeStyles } from 'tss-react/mui'
import { getTipById } from '../../../components/ftue/tip-card-content'
import { useIsViewOnly } from '../../../hooks/matter/viewer/matter-viewer-hooks'
import { clearTour } from '../../../services/tour/tour-actions'
import juralioTheme from '../../../theme/juralio-theme'
import TemplateCard from '../../template-list/template-card/TemplateCard'
import ClosableMasonryItem from './ClosableMasonryItem'

const style = makeStyles()(() => ({
  content: {
    height: 'fit-content',
  },
  disable: {
    pointerEvents: 'none',
    width: '100%',
  },
}))

const TemplateMasonry = props => {
  const { classes } = style()
  const { t } = useTranslation()
  const [isHovering, setIsHovering] = useState(false)
  const [tip, setTip] = useState(getTipById(t, props.tipId))
  const [mobileSwipeStart, setMobileSwipeStart] = useState(0)
  const [mobileSwipeEnd, setMobileSwipeEnd] = useState(0)
  const isMobileView = useMediaQuery(juralioTheme.breakpoints.down('md'))
  const history = useNavigate()
  const dispatch = useDispatch()
  const isViewOnly = useIsViewOnly({ activities: [] })

  useEffect(() => {
    let hideTips = window.sessionStorage.getItem('hideTemplates')
    if (hideTips != null) {
      setTip(null)
    }
  }, [])

  const closeTip = () => {
    window.sessionStorage.setItem('hideTemplates', true)
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
    if (props.template.isInitialTemplate) {
      dispatch(clearTour())
      window.sessionStorage.setItem('onInitialTutorial', true)
      history(`/template/${props.template.id}/taskmap`)
    } else {
      history(`/template/${props.template.id}/overview`)
    }
  }

  return (
    // 'Class'es required for layout.
    <div data-test="masonry-item" class="item">
      <div
        className={classes.content}
        class="content"
        data-test={`template-card${
          props.template.isInitialTemplate ? '-initial' : ''
        }`}
      >
        <Paper
          onMouseEnter={() => {
            if (!isMobileView && !props.template.isInitialTemplate) {
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
        >
          <ClosableMasonryItem
            isHovering={isHovering}
            dataTest={'template'}
            closeTip={closeTip}
            content={
              <div
                onClick={handleMasonryClick}
                style={{ width: 'calc(100% - 22px)', cursor: 'pointer' }}
              >
                <div className={classes.disable}>
                  <TemplateCard
                    template={props.template}
                    width={'100%'}
                    noMargin
                    isFavourited={props.template.isFavourited}
                    isHighlighted={false}
                    useFullWidth={true}
                    showFavourite={false}
                    disableFavouriting={isViewOnly}
                    clickHandler={() => {}}
                  />
                </div>
              </div>
            }
          />
        </Paper>
      </div>
    </div>
  )
}

export default TemplateMasonry
