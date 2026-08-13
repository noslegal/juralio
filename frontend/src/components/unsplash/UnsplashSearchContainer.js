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

import { Link, Paper, Popover, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import useDebounce from '../../hooks/debounce-hook'
import {
  triggerDownload,
  unsplashSearch,
} from '../../services/helpers/unsplash/unsplash-helper'
import rawColours from '../../theme/raw-colours'
import UnsplashImageDisplay from './UnsplashImageDisplay'
import UnsplashSearchBar from './UnsplashSearchBar'

const styles = makeStyles()(theme => ({
  wrapper: { display: 'flex', flexDirection: 'column' },
  poweredBy: {
    marginLeft: 'auto',
    fontSize: theme.spacing(1.5),
    color: rawColours.primary.black[100],
    marginRight: theme.spacing(),
    display: 'flex',
  },
}))

const UnsplashSearchContainer = props => {
  const { classes } = styles()
  const [searchValue, setSearchValue] = useState('')
  const [images, setImages] = useState([])
  const [page, setPage] = useState(1)
  const [maxPages, setMaxPages] = useState(null)
  const [noResults, setNoResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceValue = useDebounce(searchValue, 500)
  const { t } = useTranslation()

  const doSearch = value => {
    unsplashSearch(value, page).then(res => {
      if (res.status === 200) {
        setImages([...images, ...res.response.results])
        setLoading(false)
        setMaxPages(res.response.total_pages)
        setNoResults([...images, ...res.response.results].length === 0)
      }
    })
  }

  const useSelectedImage = id => {
    let image = images.find(image => image.id === id)
    let url = image.urls.regular
    let tags = image.tags ? image.tags.map(tag => tag.title) : []
    let credit = image.user.links.html
    let creditName = image.user.name
    triggerDownload(image.links.download_location)
    props.handleSelectedImage(url, credit, creditName, tags)
  }

  useEffect(() => {
    if (debounceValue !== '') {
      doSearch(debounceValue)
    }
  }, [debounceValue, page]) //eslint-disable-line

  useEffect(() => {
    setLoading(true)
    setImages([])
  }, [searchValue])
  return (
    <Popover
      style={{ marginTop: '120px' }}
      anchorEl={props.anchorEl}
      open={true}
      onClose={props.onClose}
    >
      <Paper className={classes.wrapper}>
        <UnsplashSearchBar
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
        {searchValue.length > 0 && (
          <UnsplashImageDisplay
            loading={loading}
            images={images}
            loadNextPage={() => setPage(page + 1)}
            hasReachedMaxPages={page === maxPages}
            noResults={noResults}
            selectImage={useSelectedImage}
          />
        )}
        <Typography className={classes.poweredBy}>
          {t('templates.unsplash.poweredBy')}&nbsp;
          <Link
            target="_blank"
            rel="noopener"
            href="https://unsplash.com?umt_source=Juralio+Template+Card+Background+Images&utm_medium=referral/"
          >
            {t('templates.unsplash.unsplash')}
          </Link>
        </Typography>
      </Paper>
    </Popover>
  )
}
export default UnsplashSearchContainer
