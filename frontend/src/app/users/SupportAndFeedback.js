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

import { Link, Typography } from '@mui/material'
import React from 'react'
import { Trans } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import image from '../../assets/images/Mountain.png'
import PanelTitle from '../organisation/users/panels/PanelTitle'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.spacing(),
  },
  link: {
    display: 'inline',
    cursor: 'pointer',
  },
  heading: {
    display: 'flex',
    paddingBottom: theme.spacing(3),
  },
  image: {
    position: 'absolute',
    maxWidth: '90%',
    bottom: 0,
    right: 0,
    pointerEvents: 'none',
  },
}))

const HelpManual = props => {
  const t = props.t
  const { classes } = useStyles()

  return (
    <div>
      <div className={classes.root}>
        <div className={classes.heading}>
          <PanelTitle
            icon={props.icon}
            header={t('howToUseJuralio.supportHeader')}
            caption={t('howToUseJuralio.supportSubheader')}
            headerVariant="h5"
          />
        </div>
        <Typography data-test="support-and-feedback-text">
          {/*prettier-ignore*/}
          <Trans t={t} i18nKey="howToUseJuralio.supportContent">
            Problems or suggestions? We'd love to hear from you. Email us at <Link data-test="support-and-feedback-email" className={classes.link} href="mailto:support@example.com">support@example.com</Link>. We aim to respond in the same or next business day.
          </Trans>
        </Typography>
        <img
          src={image}
          data-test="support-and-feedback-image"
          alt={'moutain'}
          className={classes.image}
        />
      </div>
    </div>
  )
}
export default HelpManual
