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

import { CircularProgress, Link, Typography } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { useIntersection } from '../../hooks/in-view-hook'

const styles = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    maxHeight: '500px',
    overflowY: 'auto',
    maxWidth: '431px',
  },
  image: {
    cursor: 'pointer',
    height: '133px',
    margin: '4px',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: ' center center',
  },
  column: {
    flex: '50%',
    maxWidth: '50%',
  },
  hoverDetails: {
    position: 'relative',
    top: '113px',
    height: '20px',
    width: '100%',
    background: 'rgba(0,0,0,0.5)',
  },
  artistLink: {
    color: 'white',
    opacity: '70%',
  },
  loading: {
    marginLeft: 'auto',
    marginRight: 'auto',
    height: '30px',
  },
  artistName: {
    marginLeft: theme.spacing(0.5),
  },
  noResults: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  loadingWrapper: {
    height: '30px',
    width: '100%',
    display: 'flex',
  },
}))

const UnsplashImageDisplay = props => {
  const { classes } = styles()
  const [hoverId, setHoverId] = useState(null)
  const { t } = useTranslation()
  const ref = useRef()
  const inView = useIntersection(ref, '0px')

  let columns = [[], []]
  props.images.map(image => {
    if (columns[1].length >= columns[0].length) {
      columns[0].push(image)
    } else {
      columns[1].push(image)
    }
    return null
  })

  useEffect(() => {
    if (inView) {
      props.loadNextPage()
    }
  }, [inView]) //eslint-disable-line

  const getImage = image => {
    return (
      <div
        className={classes.image}
        data-test="unsplash-image"
        onMouseEnter={() => {
          setHoverId(image.id)
        }}
        onMouseLeave={() => setHoverId(null)}
        onClick={() => props.selectImage(image.id)}
        style={{
          backgroundImage: `url(${image.urls.thumb})`,
        }}
      >
        {hoverId === image.id && (
          <div className={classes.hoverDetails}>
            <Link
              target="_blank"
              rel="noopener"
              onClick={e => {
                e.stopPropagation()
              }}
              href={image.user.links.html}
              className={classes.artistLink}
            >
              <Typography className={classes.artistName}>
                {image.user.name}
              </Typography>
            </Link>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.column}>
        {columns[0].map(image => {
          return getImage(image)
        })}
      </div>
      <div className={classes.column}>
        {columns[1].map(image => {
          return getImage(image)
        })}
      </div>
      {props.noResults && (
        <Typography className={classes.noResults}>
          {t('templates.unsplash.noResults')}
        </Typography>
      )}
      {!props.hasReachedMaxPages && !props.noResults && (
        <div className={classes.loadingWrapper}>
          <CircularProgress
            size={20}
            ref={ref}
            thickness={2}
            className={classes.loading}
          />
        </div>
      )}
    </div>
  )
}
export default UnsplashImageDisplay
