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

import Typography from '@mui/material/Typography'
import React from 'react'
import { makeStyles } from 'tss-react/mui'

const styles = makeStyles()(theme => ({
  header: {
    display: 'flex',
  },
  cardTitle: {
    marginLeft: theme.spacing(1),
  },
}))

function CardHeader(props) {
  const { classes } = styles()
  return (
    <div className={classes.header} data-test="card-header">
      <div data-test="card-header-icon">{props.icon}</div>
      <Typography
        className={classes.cardTitle}
        variant="subtitle1"
        data-test="card-header-title"
      >
        {props.title}
      </Typography>
    </div>
  )
}

export default CardHeader
