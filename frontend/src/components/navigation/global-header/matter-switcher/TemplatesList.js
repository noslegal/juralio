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

import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Button, Card, Typography } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import TemplateCard from '../../../../app/template-list/template-card/TemplateCard'
import image from '../../../../assets/images/MartenLook.png'
import juralioColours from '../../../../theme/juralio-colours'

const style = makeStyles()(theme => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    width: '100%',
    paddingTop: theme.spacing(1),
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    flexBasis: '100%',
    flex: 1,
    paddingLeft: theme.spacing(1.25),
  },
  templateWrapper: {
    flexWrap: 'wrap',
    display: 'flex',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(5),
  },
  skeletonWrapper: {
    flexWrap: 'nowrap',
    paddingTop: theme.spacing(2),
  },
  templateGalleryButton: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
    color: juralioColours.whiteText.primary,
    width: theme.spacing(38),
    backgroundColor: juralioColours.named.purple[300],
    '&:hover': {
      backgroundColor: juralioColours.named.purple[300],
    },
  },
  galleryPanel: {
    height: theme.spacing(7),
    display: 'flex',
    position: 'absolute',
    bottom: '-4px',
    width: '100%',
    background: juralioColours.named.purple[300],
  },
  scrollShadow: {
    borderRadius: '0px 0px 3px 3px',
    boxShadow: '0px -4px 3px rgba(50, 50, 50, 0.15)',
  },
  skeletonCard: {
    width: 'calc(100% - 16px)',
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    display: 'flex',
  },
  skeletonTextTop: {
    alignSelf: 'center',
    marginTop: '-10px',
  },
  skeletonTextBottom: {
    alignSelf: 'center',
    marginTop: theme.spacing(9.75),
  },
  skeletonTextBottomRight: {
    alignSelf: 'center',
    marginTop: theme.spacing(9.75),
    marginLeft: theme.spacing(12.5),
  },
  templateZeroState: {
    textAlign: 'center',
    marginTop: theme.spacing(36.25),
    padding: theme.spacing(1.5),
  },
  skeletonImage: {
    marginLeft: theme.spacing(3),
  },
  zeroState: {
    width: '150px',
    height: '300px',
    top: '375px',
    left: '400px',
    position: 'absolute',
  },
}))

const TemplatesList = props => {
  const { t } = useTranslation()
  const history = useNavigate()
  const { templatesList } = props
  const { classes } = style()
  const templates = templatesList.isLoaded
    ? templatesList.templates.slice(0, 10)
    : []
  templates.sort((a, b) => b.isFavourited - a.isFavourited)

  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!isLoaded) {
      setTimeout(() => {
        setIsLoaded(templatesList.isLoaded)
      }, 250)
    } else {
      setIsLoaded(templatesList.isLoaded)
    }
  }, [templatesList.isLoaded]) //eslint-disable-line

  //if selected template exists move it to the top
  templates.some(
    (item, idx) =>
      item.id === props.selectedTemplate.id &&
      templates.unshift(templates.splice(idx, 1)[0])
  )

  const skeletonUI = () => {
    return (
      <div className={classes.row}>
        <div className={classes.column}>
          <Card className={classes.skeletonCard}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Skeleton
                variant="text"
                width={220}
                height={40}
                className={classes.skeletonTextTop}
              />
              <div style={{ display: 'flex' }}>
                <Skeleton
                  variant="text"
                  width={80}
                  height={40}
                  className={classes.skeletonTextBottom}
                />
                <Skeleton
                  variant="text"
                  width={40}
                  height={40}
                  className={classes.skeletonTextBottomRight}
                />
              </div>
            </div>
            <Skeleton
              variant="rectangular"
              width={240}
              height={120}
              className={classes.skeletonImage}
            />
          </Card>
        </div>
      </div>
    )
  }

  return (
    <>
      <div data-test="templates-list">
        {isLoaded && templates.length === 0 && (
          <div>
            <Typography
              data-test="template-zero-state"
              className={classes.templateZeroState}
            >
              {t('templateOverview.noTemplatesExist')}
            </Typography>
            <img
              src={image}
              alt="Zero state graphic"
              data-test="zero-state-image"
              className={classes.zeroState}
            />
          </div>
        )}
        {isLoaded && templates.length !== 0 && (
          <div
            className={classes.templateWrapper}
            data-test="template-switcher-wrapper"
          >
            {templates.map(template => {
              return (
                <TemplateCard
                  key={template.id}
                  width={'100%'}
                  clickHandler={() => {
                    props.closeSwitcher()
                    history('/template/' + template.id + '/overview')
                  }}
                  isFavourited={template.isFavourited}
                  isFavouriteActive={true}
                  listContext={true}
                  template={template}
                  showFavourite={template.isFavourited}
                  disableFavouriting={true}
                  isSelected={props.selectedTemplate.id === template.id}
                />
              )
            })}
          </div>
        )}
        {!isLoaded && (
          <div className={classes.skeletonWrapper}>
            {skeletonUI()}
            {skeletonUI()}
            {skeletonUI()}
            {skeletonUI()}
          </div>
        )}
      </div>
      <div className={`${classes.galleryPanel}  ${classes.scrollShadow}`}>
        <Button
          data-test="go-to-template-button"
          endIcon={<ChevronRightIcon />}
          variant="contained"
          className={classes.templateGalleryButton}
          onClick={() => {
            props.closeSwitcher()
            history('/templates')
          }}
          disableElevation
        >
          {t('templateOverview.goToTemplates')}
        </Button>
      </div>
    </>
  )
}

export default TemplatesList
