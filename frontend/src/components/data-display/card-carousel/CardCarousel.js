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
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { displayConfirmationDialog } from '../../../app/global-confirmation-dialog/global-confirmation-dialog-actions'
import { deleteTemplateResource } from '../../../app/template/template-actions'
import JurWebLink from '../../../assets/images/JurWebLink'
import { deleteMatterResource } from '../../../redux/ducks/matter-resources'
import { deleteWorkstreamResource } from '../../../redux/ducks/workstream-resources'
import JuralioCard from './Card'
import CardMenu from './CardOptions'
const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    overflowX: 'auto',
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(0.1),
  },
  noSearchResults: {
    height: theme.spacing(6),
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
}))

const CardCarousel = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const dispatch = useDispatch()

  const renderCard = card => (
    <JuralioCard
      card={card}
      disableTooltips={props.disableTooltips || props.isTemplate}
      viewOnly={props.viewOnly}
      openMenu={target => setMenuAnchor(target)}
      selectCard={id => setSelectedCard(id)}
    />
  )

  let cards = props.resources.filter(
    link =>
      link.name?.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
      link.url?.toLowerCase().includes(props.searchQuery.toLowerCase())
  )

  if (props.limit) {
    cards = cards.slice(0, props.limit)
  }

  const handleDelete = () => {
    setMenuAnchor(null)
    dispatch(
      displayConfirmationDialog(
        {
          actionText: t('common.confirm'),
          titleText: t('matter.overview.deleteMatterResource'),
          promptText: t('matter.overview.deleteMatterResourceConfirmText'),
          usageContext: 'matterResourcesDelete',
          headerIcon: JurWebLink,
        },
        () => {
          if (props.isTemplate) {
            dispatch(deleteTemplateResource(props.projectId, selectedCard))
          } else if (props.projectId) {
            dispatch(
              deleteWorkstreamResource(
                props.matterId,
                props.projectId,
                selectedCard
              )
            )
          } else {
            dispatch(deleteMatterResource(props.matterId, selectedCard))
          }
        }
      )
    )
  }

  return (
    <div className={classes.root} data-test="card-carousel">
      {cards.map(card => renderCard(card))}
      {cards.length === 0 && props.searchQuery.length > 0 && (
        <Typography className={classes.noSearchResults}>
          {t('common.noSearchResults')}
        </Typography>
      )}
      {menuAnchor && (
        <CardMenu
          anchor={menuAnchor}
          close={() => setMenuAnchor(null)}
          handleDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default CardCarousel
