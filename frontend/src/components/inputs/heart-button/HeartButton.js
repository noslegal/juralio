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

import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { IconButton } from '@mui/material'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'

const useStyles = makeStyles()(() => ({
  button: {
    padding: 'unset',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  heart: {
    color: JuralioNamedColours.red.main,
  },
}))

const HeartButton = props => {
  const { hearted, heartAction, isClickable } = props
  const [isFilled, setIsFilled] = useState(hearted)
  const { classes } = useStyles()

  useEffect(() => {
    setIsFilled(hearted)
  }, [hearted])

  return isClickable ? (
    <IconButton
      onClick={e => {
        e.stopPropagation()

        heartAction(!hearted)
      }}
      data-test="heart-button"
      className={classes.button}
      size="large"
    >
      {isFilled && (
        <FavoriteIcon className={classes.heart} data-test="favourited" />
      )}
      {!isFilled && <FavoriteBorderIcon data-test="not-favourited" />}
    </IconButton>
  ) : (
    <>
      {isFilled && (
        <FavoriteIcon className={classes.heart} data-test="favourited" />
      )}
      {!isFilled && <FavoriteBorderIcon data-test="not-favourited" />}
    </>
  )
}

HeartButton.propTypes = {
  hearted: PropTypes.bool,
  heartAction: PropTypes.func.isRequired,
  isClickable: PropTypes.bool.isRequired,
}

export default HeartButton
