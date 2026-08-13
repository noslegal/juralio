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

import React, { useEffect, useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import {
  filterCardsByUserRole,
  generateTipCards,
  getBackgroundColour,
  isTipCardNew,
} from '../../components/ftue/tip-card-content'
import TipMasonry from '../home/matter-masonry/TipMasonry'
import PanelTitle from '../organisation/users/panels/PanelTitle'

const useStyles = makeStyles()(theme => ({
  heading: {
    display: 'flex',
    paddingBottom: theme.spacing(3),
    paddingLeft: theme.spacing(),
  },
  cardGrid: {
    display: 'grid',
    gridGap: theme.spacing(4),
    gridTemplateColumns: 'repeat(auto-fill, minmax(382px,1fr))',
    height: '100%',
    width: `calc(100% - ${theme.spacing(2)})`,
  },
}))

const AllTipCards = props => {
  const t = props.t
  const { classes } = useStyles()
  const [tipCards, setTipCards] = useState()

  useEffect(() => {
    let tips = generateTipCards(t, filterCardsByUserRole(props.userRoles))
    tips.map(card => {
      return (card.colour = getBackgroundColour(Math.floor(Math.random() * 4)))
    })
    tips.sort((a, b) => {
      const aName = a.title.toLocaleLowerCase()
      const bName = b.title.toLocaleLowerCase()
      return aName.localeCompare(bName)
    })
    tips.sort((a, b) => {
      const aNew = isTipCardNew(a.name)
      const bNew = isTipCardNew(b.name)
      return bNew - aNew
    })

    setTipCards(tips)
  }, [props.userRoles, t])

  return (
    <div>
      <div className={classes.heading}>
        <PanelTitle
          icon={props.icon}
          header={t('howToUseJuralio.tipCardsHeader')}
          caption={t('howToUseJuralio.tipCardsSubheader')}
          headerVariant="h5"
        />
      </div>
      <div className={classes.cardGrid}>
        {tipCards &&
          tipCards.map((tip, index) => {
            return (
              <TipMasonry
                key={index}
                showInteraction={false}
                tip={tip}
                colour={tip.colour}
              />
            )
          })}
      </div>
    </div>
  )
}
export default AllTipCards
