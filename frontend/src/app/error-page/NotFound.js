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

import { Button, Typography } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Navigate } from 'react-router'
import { makeStyles } from 'tss-react/mui'
import image from '../../assets/images/Tree-and-signpost-combo.png'
import JuralioLink from '../../components/navigation/juralio-link/JuralioLink'
import withRouter from '../../services/navigation/WithRouter'
import juralioColours from '../../theme/juralio-colours'
import { JuralioCoreColors } from '../../theme/juralio-core-colors'
import {
  closeSnackbar,
  showSnackbar,
} from '../global-snackbar/global-snackbar-actions'

const styles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  wrapper: {
    width: theme.spacing(46),
    display: 'flex',
    flexFlow: 'column wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    color: juralioColours.darkText.secondary,
  },
  linkStyle: {
    textDecoration: 'none',
    color: JuralioCoreColors.primary.main,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  linkRow: {
    display: 'flex',
  },
  snackbarBackButton: {
    color: juralioColours.darkText.secondary,
    fontSize: theme.spacing(1.5),
  },
  image: {
    width: '350px',
    height: '340px',
    pointerEvents: 'none',
  },
  buttonText: {
    textDecoration: 'none',
  },
}))

const NotFound = props => {
  const [redirect, setRedirect] = useState(false)
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { classes } = styles()

  const goBack = () => {
    window.history.go(-2)
    dispatch(closeSnackbar())
  }

  const handleOnClick = () => {
    setRedirect(true)
  }

  useEffect(() => {
    if (redirect) {
      return <Navigate push to="/" />
    } else {
      dispatch(
        showSnackbar(
          t('standardUserRoutes.somethingWentWrong'),
          <Button className={classes.snackbarBackButton} onClick={goBack}>
            {t('common.back')}
          </Button>
        )
      )
    }
  }, [redirect]) //eslint-disable-line

  return (
    <div className={classes.root} data-test="not-found-page">
      <div className={classes.wrapper}>
        <img className={classes.image} src={image} alt="Lost with map" />
        <Typography variant="h5" className={classes.title}>
          {t('notFound.404')}
        </Typography>
        <div className={classes.linkRow}>
          <JuralioLink
            value={
              <Typography variant="body2" className={classes.linkStyle}>
                {t('notFound.backOnePage')}
              </Typography>
            }
            onClick={goBack}
            variant="caption"
            className={classes.buttonText}
          />
          <JuralioLink
            value={
              <Typography variant="body2" className={classes.linkStyle}>
                {t('notFound.home')}
              </Typography>
            }
            onClick={handleOnClick}
            variant="caption"
            className={classes.buttonText}
          />
        </div>
      </div>
    </div>
  )
}

export default withRouter(NotFound)
