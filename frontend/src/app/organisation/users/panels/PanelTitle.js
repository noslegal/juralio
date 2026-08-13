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
import PropTypes from 'prop-types'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  title: {
    display: 'flex',
  },
  titleText: {
    marginLeft: theme.spacing(),
  },
  caption: {
    padding: theme.spacing(1, 0, 1, 0),
    color: juralioColours.darkText.secondary,
  },
}))

const PanelTitle = props => {
  const { classes } = useStyles()
  const { icon, header, caption, headerVariant = 'subtitle1' } = props

  return (
    <div className={classes.root}>
      <div className={classes.title}>
        {icon}
        <Typography
          data-test="panel-title"
          className={classes.titleText}
          variant={headerVariant}
        >
          {header}
        </Typography>
      </div>
      <div className={classes.caption} data-test="panel-caption">
        <Typography variant="caption">{caption}</Typography>
      </div>
    </div>
  )
}

PanelTitle.propTypes = {
  icon: PropTypes.any,
  header: PropTypes.string,
  caption: PropTypes.string,
  headerVariant: PropTypes.string,
}

export default PanelTitle
