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

import Skeleton from '@mui/material/Skeleton'
import { Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import zeroStateImage from '../../../../assets/images/MartenWalkLeft.png'
import rawColours from '../../../../theme/raw-colours'
import TemplateItem from './TemplateItem'

const useStyles = makeStyles()(theme => ({
  container: {
    width: '100%',
    height: '100%',
    overflowX: 'hidden',
    overflowY: 'scroll',
    backgroundColor: rawColours.primary.purple.secondary,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    boxSizing: 'border-box',
  },
  skeletonContainer: {
    margin: `${theme.spacing(0.75)} ${theme.spacing(1.5)}`,
  },
  zeroStateContainer: {
    paddingTop: '200px',
  },
  zeroStateText: {
    textAlign: 'center',
    color: rawColours.primary.white.primary,
    padding: theme.spacing(2),
  },
  image: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(3),
    display: 'block',
  },
}))

const TemplateSwitcherList = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const skeletonCount = Math.floor(window.innerHeight / 72)

  const loadingSkeleton = i => (
    <div className={classes.skeletonContainer} key={'SK' + i}>
      <Skeleton
        variant="rectangular"
        width="100%"
        height={72}
        sx={{ borderRadius: 0.5 }}
      />
    </div>
  )

  return (
    <div className={classes.container} data-test="template-switcher-list">
      {!props.isLoaded &&
        Array(skeletonCount)
          .fill(1)
          .map((_, i) => loadingSkeleton(i))}
      {props.isLoaded && props.templates.length === 0 && (
        <div className={classes.zeroStateContainer}>
          <Typography className={classes.zeroStateText}>
            {t('templateOverview.noTemplatesExist')}
          </Typography>
          <img
            width={300}
            height={160}
            src={zeroStateImage}
            alt={t('templateOverview.zeroStateImageAlt')}
            className={classes.image}
          />
        </div>
      )}
      {props.isLoaded &&
        props.templates.map(template => (
          <TemplateItem
            key={template.id}
            template={template}
            isSelected={props.selectedTemplateId === template.id}
            onClick={() => props.onClick(template)}
          />
        ))}
    </div>
  )
}

export default TemplateSwitcherList
