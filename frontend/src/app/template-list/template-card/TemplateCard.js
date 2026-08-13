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

import { Link } from '@mui/material'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import PropTypes from 'prop-types'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { withStyles } from 'tss-react/mui'
import SimpleChip from '../../../components/data-display/simple-chip/SimpleChip'
import { isInTemplateListContext } from '../../../components/navigation/common/location-context-helper'
import ImageGenerator from '../../../services/helpers/image-generator/image-generator'
import { JuralioCoreColors } from '../../../theme/juralio-core-colors'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'
import rawColours from '../../../theme/raw-colours'
import FavouriteTemplateButton from '../../template/overview/FavouriteTemplateButton'
import { favouriteTemplate } from '../../template/template-actions'
import { favouriteTemplateInList } from '../template-list-actions'
import juralioColours from '../../../theme/juralio-colours'

const styles = theme => ({
  root: {
    cursor: 'pointer',
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.25),
    display: 'flex',
    flexDirection: 'row',
    flexShrink: 1,
    backgroundColor: rawColours.primary.purple[100],
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: ' center center',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      marginRight: theme.spacing(1),
    },
    border: 'solid',
    borderColor: 'rgba(0,0,0,0.2)',
    borderWidth: ' 1px',
    '&:hover': {
      backgroundColor: rawColours.primary.purple.secondary,
    },
    height: theme.spacing(16),
    position: 'relative',
  },
  fullWidth: {
    width: '100%',
    marginBottom: 0,
    minWidth: 0,
  },
  name: {
    maxWidth: theme.spacing(25),
    textOverflow: 'ellipsis',
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
    WebkitLineClamp: 3,
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    color: theme.palette.text.primary,
    textAlign: 'center',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
  },
  headerWithImage: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(235, 236, 242, 0.8)',
    borderRadius: theme.spacing(0.5),
    width: 'fit-content',
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
  },
  iconsWrapper: {
    display: 'flex',
    marginTop: 'auto',
  },
  favouriteWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(2),
  },
  heart: {
    color: JuralioNamedColours.red.main,
    marginLeft: theme.spacing(1),
  },
  greenTick: {
    position: 'absolute',
    right: theme.spacing(5),
    top: theme.spacing(2.5),
    color: JuralioCoreColors.primary[500],
  },
  highlighted: {
    backgroundColor: rawColours.primary.purple.secondary,
  },
  draftChip: {
    marginLeft: theme.spacing(1),
    width: theme.spacing(6.75),
    marginRight: theme.spacing(),
  },
  dataColumn: {
    width: '50%',
    display: 'flex',
    flexDirection: 'column',
    paddingRight: theme.spacing(0.5),
  },
  previewImage: {
    backgroundColor: 'white',
    borderRadius: theme.spacing(),
    display: 'flex',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: ' center center',
    height: '104px',

    marginLeft: 'auto',
    marginRight: 'auto',
    width: '80%',
  },
  systemTemplateText: {
    color: rawColours.primary.black[200],
    backgroundColor: 'rgba(235, 236, 242, 0.8)',
    width: 'fit-content',
    borderRadius: '0px 0px 4px 4px',
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
  },
  artistCredit: {
    display: 'flex',
    flexDirection: 'row',
    fontSize: '7px',
    color: rawColours.primary.black[200],
    paddingLeft: '4px',
    paddingRight: '4px',
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },
  artistLink: {
    color: rawColours.primary.black[200],
    textDecoration: 'underline',
  },
  creditWrapper: {
    backgroundColor: 'rgba(235, 236, 242, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
    marginLeft: 'auto',
    marginRight: 'auto',
    width: 'fit-content',
    minWidth: '80%',
  },
  previewWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 'auto',
    width: '45%',
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
})

const TemplateCard = props => {
  const { t } = useTranslation()
  const { listContext } = props
  const dispatch = useDispatch()
  const location = useLocation()
  const isInGallery = isInTemplateListContext(location)
  const anchor = useRef()
  const favouriteTemplateHandler = (template, favourited) => {
    dispatch(
      favouriteTemplate(
        template.databaseUID ? template.databaseUID : template.id,
        favourited
      )
    )
    if (listContext) {
      dispatch(favouriteTemplateInList(template.id, favourited))
    }
  }

  const {
    classes,
    clickHandler,
    isFavourited,
    isHighlighted,
    isFavouriteActive,
    template,
    useFullWidth,
  } = props

  const daysSinceUpdate =
    (new Date().getTime() - Date.parse(template.systemTemplateLastUpdated)) /
    (1000 * 60 * 60 * 24)
  return (
    <Card
      key={props.template.id}
      className={`${props.classes.root} ${
        props.isHighlighted ? props.classes.highlighted : ''
      }
      ${props.isSelected ? props.classes.highlighted : ''}
       ${useFullWidth ? props.classes.fullWidth : ''}`}
      data-test="template"
      data-recordid={template.id}
      onClick={() =>
        clickHandler(
          template?.databaseUID ? template?.databaseUID : template.id
        )
      }
      style={{
        width: props.width ? props.width : '460px',
        margin: props.noMargin ? '0px' : '',
        flex: isInGallery ? '1 1 380px' : '',
        minWidth: isInGallery ? '380px' : '',
        maxWidth: isInGallery ? '460px' : '',
        backgroundImage: props.template.url
          ? `url(${props.template.url})`
          : null,
        backgroundColor: isHighlighted
          ? rawColours.primary.purple.secondary
          : '',
      }}
    >
      {template.isSystemTemplate &&
        template.systemTemplateLastUpdated &&
        daysSinceUpdate < 28 && (
          <div className={classes.ribbon}>
            <Typography
              style={{
                fontSize: template.systemTemplateUpdateCount < 2 ? '' : '10px',
                marginLeft: template.systemTemplateUpdateCount < 2 ? '' : '8px',
              }}
            >
              {template.systemTemplateUpdateCount < 2
                ? t('ribbon.new')
                : t('ribbon.updated')}
            </Typography>
          </div>
        )}

      <div className={classes.dataColumn}>
        <div
          className={classes.headerWithImage}
          style={{
            borderRadius: template.isSystemTemplate ? '4px 4px 4px 0px' : '4px',
          }}
        >
          <Typography
            data-test="template-name"
            variant="subtitle1"
            className={classes.name}
          >
            {template.name}
          </Typography>
        </div>
        {template.isSystemTemplate && (
          <Typography
            variant="caption"
            className={props.classes.systemTemplateText}
            data-test="system-template"
          >
            {template.providedBy
              ? t('templates.providedBy') + template.providedBy
              : t('templates.systemTemplate')}
          </Typography>
        )}
        <div className={classes.iconsWrapper}>
          <div className={classes.favouriteWrapper}>
            {props.showFavourite && (
              <FavouriteTemplateButton
                disableFavouriting={props.disableFavouriting}
                hearted={isFavourited}
                action={
                  isFavouriteActive
                    ? () => favouriteTemplateHandler(template, !isFavourited)
                    : () => {}
                }
              />
            )}
            {!template.published && (
              <div className={classes.draftChip}>
                <SimpleChip
                  text={template.published ? '' : t('templates.draft')}
                  options={{
                    color: juralioColours.whiteText.primary,
                    backgroundColor: juralioColours.named.black[100],
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div
        className={classes.previewWrapper}
        style={{
          marginBottom: template.urlCreditName ? '' : '24px',
        }}
      >
        <div
          className={classes.previewImage}
          ref={anchor}
          style={{
            backgroundImage: template.companyImage
              ? `url(${template.companyImage})`
              : '',
          }}
        >
          {!template.companyImage && (
            <ImageGenerator
              templateId={template.id}
              height={100}
              anchor={anchor}
            />
          )}
        </div>
        {template.urlCreditName && (
          <div className={classes.creditWrapper}>
            <Typography className={classes.artistCredit}>
              {t('templates.unsplash.photoBy')}&nbsp;
              <Link
                target="_blank"
                rel="noopener"
                href={template.urlCredit}
                className={classes.artistLink}
                onClick={e => e.stopPropagation()}
              >
                {template.urlCreditName}
              </Link>
              &nbsp; {t('templates.unsplash.on')}&nbsp;
              <Link
                target="_blank"
                rel="noopener"
                href={
                  'https://?umt_source=Juralio+Template+Card+Background+Images&utm_medium=referral'
                }
                className={classes.artistLink}
                onClick={e => e.stopPropagation()}
              >
                {t('templates.unsplash.unsplash')}
              </Link>
            </Typography>
          </div>
        )}
      </div>
    </Card>
  )
}

TemplateCard.propTypes = {
  template: PropTypes.object.isRequired,
  clickHandler: PropTypes.func,
  isFavourited: PropTypes.bool,
  useFullWidth: PropTypes.bool,
}

export default withStyles(TemplateCard, styles)
