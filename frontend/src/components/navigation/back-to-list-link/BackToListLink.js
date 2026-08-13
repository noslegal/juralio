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

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { Typography } from '@mui/material'
import Button from '@mui/material/Button'
import PropTypes from 'prop-types'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  root: {
    padding: theme.spacing(),
    marginBottom: theme.spacing(),
    color: juralioColours.greenBlue.primary,
    textTransform: 'none',
  },
  linkText: {
    letterSpacing: 0,
    color: juralioColours.greenBlue.primary,
  },
}))

const BackToListLink = props => {
  const { classes } = useStyles()
  return (
    <Button
      className={classes.root}
      disableElevation
      startIcon={<ChevronLeftIcon />}
      onClick={props.actionHandler}
      data-test="back-to-list-button"
    >
      <Typography
        data-test="back-to-list-link-text"
        variant="caption"
        className={classes.linkText}
      >
        {props.linkText}
      </Typography>
    </Button>
  )
}

BackToListLink.propTypes = {
  actionHandler: PropTypes.func.isRequired,
  linkText: PropTypes.string.isRequired,
}

export default BackToListLink
