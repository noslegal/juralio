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

import React from 'react'

import { makeStyles } from 'tss-react/mui'
import { Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import rawColours from '../../theme/raw-colours'
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined'
import CostsDashboardImg from './CostsDashboardImg'

const useStyles = makeStyles()(theme => ({
  buttonStyle: {
    textTransform: 'none',
    fontWeight: 'bold',
    color: rawColours.primary.grey.main,
    backgroundColor: rawColours.primary.black[200],
    borderRadius: theme.spacing(0.75),
    padding: theme.spacing(1),
    textAlign: 'center',
    display: 'flex',
    marginTop: theme.spacing(4),
    width: 'fit-content',
    alignItems: 'center',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: rawColours.primary.black.black,
    },
    justifySelf: 'center',
  },
  subtitle: {
    marginTop: theme.spacing(2),
    textAlign: 'center',
  },
  icon: {
    alignSelf: 'center',
    marginLeft: theme.spacing(1),
  },
  wrapper: {
    margin: '50px',
  },
  text: {
    fontWeight: 'bolder',
    textAlign: 'center',
  },
}))

const CostsReadOnlyNotSetup = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  return (
    <div>
      <div className={classes.wrapper}>
        <Typography className={classes.text} variant="h3">
          {t('matterCosts.notSetupViewOnlyTitle')}
        </Typography>

        <CostsDashboardImg />
        <Typography className={classes.subtitle} variant="h5">
          {t('matterCosts.notSetupViewOnlySubtitle1')}
        </Typography>
        <Typography className={classes.subtitle} variant="h5">
          <>{t('matterCosts.notSetupViewOnlySubtitle2')}</>
        </Typography>
        <div
          //onClick={handleClick}
          className={classes.buttonStyle}
        >
          <Typography> {t('matterCosts.notSetupViewOnlyButton')}</Typography>
          <HelpOutlineIcon className={classes.icon} />
        </div>
      </div>
    </div>
  )
}

export default CostsReadOnlyNotSetup
