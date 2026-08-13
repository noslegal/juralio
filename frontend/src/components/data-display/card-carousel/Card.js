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

import { MoreVert } from '@mui/icons-material'
import {
  Card,
  CardActionArea,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import CardContent from '@mui/material/CardContent'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { DATE_FORMAT_FULL } from '../../../app/constants'
import { getImageHelper } from '../../../services/favicon/favicon-service'
import { getDateDisplayString } from '../../../services/helpers/date-helper'
import matterService from '../../../services/matter/matter-service'
import { formatUserDisplayName } from '../../../services/user/helper/user-format-service'

const style = makeStyles()(theme => ({
  card: {
    marginRight: theme.spacing(2),
    overflow: 'unset',
  },
  cardContent: {
    padding: theme.spacing(1.5),

    display: 'flex',
    maxWidth: 200,
    minWidth: 128,
    height: 48,
  },
  resourceImage: {
    width: 32,
    height: 32,
  },
  textWrapper: {
    padding: 0,
    paddingLeft: theme.spacing(1),
    overflow: 'hidden',
    maxHeight: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
  },
  optionButton: {
    padding: theme.spacing(0),
  },
}))

const CarouselCard = props => {
  const { card, disableClick } = props
  const { classes } = style()
  const { t } = useTranslation()

  const getCreatorTitle = () => {
    if (!card.creator) {
      return null
    }
    return t('matter.overview.linkResourceCreatedBy', {
      link_name: card.name,
      username: formatUserDisplayName(card.creator),
      creation_date: getDateDisplayString(
        card.dateCreated,
        DATE_FORMAT_FULL,
        true
      ),
    })
  }

  return (
    <Card
      className={classes.card}
      data-test="card"
      onClick={e => {
        if (card.url && !disableClick) {
          e.stopPropagation()
          matterService.visitMatterResource(card.matterId, card.id)
          if (props.card.matterId) {
          } else {
          }

          window.open(card.url, '_blank').focus()
        }
      }}
    >
      <Tooltip
        disableHoverListener={props.disableTooltips}
        title={getCreatorTitle()}
      >
        <CardActionArea
          className={classes.cardContent}
          disabled={props.disableClick}
          style={{ paddingRight: !props.viewOnly && '4px' }}
        >
          {card.url && (
            <img
              className={classes.resourceImage}
              src={getImageHelper(card.url)}
              alt={t('notificationIcon.notificationIconAlt')}
            />
          )}
          <CardContent className={classes.textWrapper}>
            <Typography variant="caption" data-test="card-name">
              {card.name}
            </Typography>
            <Typography
              variant="caption"
              data-test="card-url"
              color="textSecondary"
            >
              {card.url}
            </Typography>
          </CardContent>
          {!props.viewOnly && (
            <IconButton
              className={classes.optionButton}
              data-test="card-options"
              onClick={e => {
                e.stopPropagation()
                props.selectCard(props.card.id)
                props.openMenu(e.currentTarget)
              }}
              size="large"
            >
              <MoreVert />
            </IconButton>
          )}
        </CardActionArea>
      </Tooltip>
    </Card>
  )
}

export default CarouselCard
