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

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import zeroStateImage from '../../../assets/images/landscape.png'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  zeroStateImage: {
    width: '50%',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    pointerEvents: 'none',
  },
  zeroStateText: {
    marginBottom: theme.spacing(2),
  },
  action: {
    marginBottom: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}))

const MatterClosed = ({ isAdmin, matterId }) => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className={classes.root} data-test="matter-closed">
      <img
        src={zeroStateImage}
        data-test="zero-state-image"
        alt={'landscape'}
        className={classes.zeroStateImage}
      />
      <Typography
        align="center"
        className={classes.zeroStateText}
        variant={'h4'}
        data-test={'zero-state-text'}
      >
        {t('matterClosed.title')}
      </Typography>
      {isAdmin && (
        <Button
          className={classes.action}
          variant="contained"
          color="primary"
          data-test="matter-closed-admin-action"
          onClick={() => navigate(`/matteradmin/${matterId}`)}
        >
          {t('matterClosed.adminAction')}
        </Button>
      )}
    </div>
  )
}

export default MatterClosed
