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

import { Typography, useMediaQuery } from '@mui/material'
import React from 'react'
import { withStyles } from 'tss-react/mui'
import juralioTheme from '../../../theme/juralio-theme'

const styles = theme => ({
  layout: {
    paddingBottom: theme.spacing(5),
    padingTop: theme.spacing(5),
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    display: 'flex',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
  },
  subHeader: {
    marginTop: theme.spacing(2),
    maxWidth: theme.spacing(65),
  },
  image: {
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(2.5),
    paddingLeft: theme.spacing(0),
    width: '40%',
  },
})

const FTUEScreen = props => {
  const isMobileView = useMediaQuery(juralioTheme.breakpoints.down('md'))

  return (
    <div className={props.classes.layout}>
      <div
        data-test={props['data-test']}
        className={props.classes.content}
        style={{ flexDirection: isMobileView ? 'column' : 'row' }}
      >
        <img
          src={`${props.imageurl}`}
          className={props.classes.image}
          alt="ftue-wizard"
        />

        {props.dangerous && (
          <Typography
            variant="subtitle1"
            className={props.classes.subHeader}
            color="textSecondary"
            dangerouslySetInnerHTML={{
              __html: props.subTitleText,
            }}
          />
        )}
        {!props.dangerous && (
          <Typography
            variant="subtitle1"
            className={props.classes.subHeader}
            color="textSecondary"
          >
            {props.subTitleText}
          </Typography>
        )}
      </div>
    </div>
  )
}

export default withStyles(FTUEScreen, styles)
