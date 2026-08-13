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

import { Typography, useMediaQuery } from '@mui/material'
import cloneDeep from 'lodash/cloneDeep'
import shuffle from 'lodash/shuffle'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import zeroStateImage from '../../../assets/images/SignpostwithBG.png'
import { getRandomTipId } from '../../../components/ftue/tip-card-content'
import templateService from '../../../services/template/template-service'
import juralioTheme from '../../../theme/juralio-theme'
import rawColours from '../../../theme/raw-colours'
import { ACTIVITIES } from '../../constants'
//import CreateNewButtonCardMasonry from './CreateNewButtonCardMasonry'
import MatterMasonry from './MatterMasonry'
import MatterMasonryLoadingState, {
  LoadingCard,
} from './MatterMasonyLoadingState'
import TemplateMasonry from './TemplateMasonry'
import TipMasonry from './TipMasonry'
const style = makeStyles()(theme => ({
  grid: {
    display: 'grid',
    gridGap: theme.spacing(1.25),
    gridTemplateColumns: 'repeat(auto-fill, minmax(382px,1fr))',
    gridAutoRows: '1px',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    width: `calc(100% - ${theme.spacing(2)})`,
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  wrapper: {
    width: '100%',
  },
  notMatterEditor: {
    marginTop: theme.spacing(6),
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
  },
}))

const _genRandomColour = () => {
  return shuffle(Object.values(rawColours.tips))[0]
}

const MatterMasonryContainer = props => {
  const { classes } = style()
  const { t } = useTranslation()
  const [wrapperHeight, setWrapperHeight] = useState(window.innerHeight - 88)
  const isMobileView = useMediaQuery(juralioTheme.breakpoints.down('md'))
  const [tips, setTips] = useState([])

  const [tipColours, setTipColours] = useState([
    _genRandomColour(),
    _genRandomColour(),
    _genRandomColour(),
    _genRandomColour(),
  ])
  const [template, setTemplate] = useState(undefined)
  const [renderMatters, setRenderMatters] = useState([])
  const [templateLoaded, setTemplateLoaded] = useState(false)
  const userRoles = useSelector(state => state.auth.data.auth.roles)

  useEffect(() => {
    templateService.getTemplates(undefined, true).then(t => {
      if (t.status === 200) {
        setTemplate(t.body)
      }
      setTemplateLoaded(t)
    })
  }, [])

  const generateTipIds = () => {
    const usedTips = []
    let id = getRandomTipId(t, usedTips)
    usedTips.push(id)
    id = getRandomTipId(t, usedTips)
    usedTips.push(id)
    id = getRandomTipId(t, usedTips)
    usedTips.push(id)
    id = getRandomTipId(t, usedTips)
    usedTips.push(id)
    setTips(usedTips)
    return usedTips
  }

  window.addEventListener('resize', () => {
    setWrapperHeight(window.innerHeight - 88)
  })
  const resizeGridItem = item => {
    let grid = document.getElementById('grid')
    let rowHeight = parseInt(
      window.getComputedStyle(grid).getPropertyValue('grid-auto-rows')
    )
    let rowGap = parseInt(
      window.getComputedStyle(grid).getPropertyValue('grid-row-gap')
    )
    let rowSpan = Math.ceil(
      (item.querySelector('.content').getBoundingClientRect().height + rowGap) /
        (rowHeight + rowGap)
    )
    item.style.gridRowEnd = 'span ' + rowSpan
  }

  const resizeAllGridItems = () => {
    let allItems = document.getElementsByClassName('item')
    for (let x = 0; x < allItems.length; x++) {
      resizeGridItem(allItems[x])
    }
  }

  useEffect(() => {
    resizeAllGridItems()
  })

  const mungeMattersList = () => {
    if (props.matters) {
      const matterProjects = matter => matter.projects
      let filteredMatters = props.matters.filter(matter => {
        const canView =
          matter.activities.includes(ACTIVITIES.MATTER_TEAM_MEMBER) ||
          matter.activities.includes(ACTIVITIES.MATTER_VIEWER)
        return matterProjects(matter).length > 0 && canView
      })
      let mungedList = cloneDeep(filteredMatters)
      if (mungedList.length === 0) {
        return mungedList
      }
      //tip cards
      const tipCardSpacing = 3
      if (filteredMatters.length < tipCardSpacing) {
        mungedList.push({
          isTip: true,
          id: tips.length > 0 ? tips[0] : generateTipIds()[0],
          colour: tipColours[0],
        })
      } else {
        mungedList.splice(2, 0, {
          isTip: true,
          id: tips.length > 1 ? tips[1] : generateTipIds()[1],
          colour: tipColours[1],
        })
      }
      if (filteredMatters.length > 5) {
        mungedList.splice(6, 0, {
          isTip: true,
          id: tips.length > 2 ? tips[2] : generateTipIds()[2],
          colour: tipColours[2],
        })
      }
      if (filteredMatters.length > 8) {
        mungedList.splice(10, 0, {
          isTip: true,
          id: tips.length > 3 ? tips[3] : generateTipIds()[3],
          colour: tipColours[3],
        })
      }
      //template card
      if (
        window.sessionStorage.getItem('hideTemplates') == null &&
        template !== undefined
      ) {
        if (filteredMatters.length < 4) {
          mungedList.push({ isTemplate: true })
        } else {
          mungedList.splice(4, 0, { isTemplate: true })
        }
      }

      return mungedList
    }
  }

  useEffect(() => {
    setRenderMatters(mungeMattersList())
  }, [props.matters, template]) // eslint-disable-line

  if (props.fullyLoaded && renderMatters.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '10%' }}>
        <img
          width="350"
          height="276"
          src={zeroStateImage}
          alt={t('inboxZeroState.imageAlt')}
          data-test="zero-state-image"
        />
        <Typography
          variant="h6"
          className={classes.notMatterEditor}
          data-test="home-zero-state-not-matter-editor"
        >
          {t('desktop.zeroState.notMatterEditor')}
        </Typography>
      </div>
    )
  }

  if (!props.startedLoading || renderMatters.length === 0) {
    return <MatterMasonryLoadingState />
  }
  return (
    <div
      className={classes.wrapper}
      style={{
        height: `${wrapperHeight}px`,
      }}
    >
      <div id="grid" className={classes.grid}>
        {/* {userRoles.includes(USER_ROLES.ROLE_MATTER_CREATOR) && (
          <CreateNewButtonCardMasonry
            bMatterTemplate={true}
            key={'create-matter'}
            resizeMasonry={() => {
              resizeAllGridItems()
            }}
          />
        )} */}
        {renderMatters.map(matter => {
          if (matter.isTemplate) {
            return (
              <TemplateMasonry
                template={template}
                key={'template' + template.id}
                resizeMasonry={() => {
                  resizeAllGridItems()
                }}
              />
            )
          }
          if (matter.isTip) {
            return (
              <TipMasonry
                colour={matter.colour}
                tipId={matter.id}
                key={'tip' + matter.id}
                resizeMasonry={() => {
                  resizeAllGridItems()
                }}
                showInteraction={true}
              />
            )
          }
          return (
            <MatterMasonry
              key={'tip' + matter.id}
              matter={matter}
              resizeMasonry={() => {
                resizeAllGridItems()
              }}
              isMobile={isMobileView}
            />
          )
        })}
        {!props.fullyLoaded && (
          <>
            <div class="item">
              <div class="content">
                <LoadingCard />
              </div>
            </div>
            <div class="item">
              <div class="content">
                <LoadingCard />
              </div>
            </div>
            <div class="item">
              <div class="content">
                <LoadingCard />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MatterMasonryContainer
