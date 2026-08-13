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
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'

const styles = theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    textAlign: 'center',
  },
})

const SearchFilterOptions = props => {
  const { t } = useTranslation()

  return (
    <div className={props.classes.root}>
      <Link
        onClick={() => {
          props.setFilterHiddenHandler()
          props.onSearchEverything()
        }}
        variant="body1"
        data-test="search-everything-filter"
      >
        {t('search.searchEverything')}
      </Link>
    </div>
  )
}

SearchFilterOptions.propTypes = {
  /** setFilterHiddenHandler */
  setFilterHiddenHandler: PropTypes.func,
  /** onSearchEverything */
  onSearchEverything: PropTypes.func,
}

export default withStyles(SearchFilterOptions, styles)
