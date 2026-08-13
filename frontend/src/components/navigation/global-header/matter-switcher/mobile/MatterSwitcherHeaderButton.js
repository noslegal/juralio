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

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import { Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import withRouter from '../../../../../services/navigation/WithRouter'
import juralioColours from '../../../../../theme/juralio-colours'

const style = makeStyles()(theme => ({
  defaultTitle: {
    paddingTop: `${theme.spacing(2)} !important`,
    color: juralioColours.darkText.secondary,
    display: 'flex',
    whiteSpace: 'nowrap',
  },
  titleContent: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    margin: 'auto',
    cursor: 'pointer',
  },
  breadcrumb: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    color: juralioColours.darkText.secondary,
  },
  breadcrumbWrapper: {
    display: 'flex',
  },
  title: {
    color: juralioColours.darkText.secondary,
    display: 'flex',
    cursor: 'pointer',
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
  },
  breadcrumbSpacing: {
    color: juralioColours.darkText.secondary,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
}))

const MatterSwitcherHeaderButton = props => {
  const { t } = useTranslation()
  const { classes } = style()
  const [isDefaultTitleState, setIsDefaultTitleState] = useState(true)
  const [isInTemplate, setIsInTemplate] = useState(false)
  const [isInMatterSettings, setIsInMatterSettings] = useState(false)

  const matterName = useSelector(state => state.matterDetails?.matter?.name)
  const templateName = useSelector(state => state.template?.template?.name)
  const projectName = useSelector(state => state.project?.name)
  const clientName = useSelector(
    state => state.matterDetails?.matter?.clientName
  )
  const user = useSelector(state => state.auth.data.details)

  useEffect(() => {
    const validHeaderLocation = ['/home', '/templates', '/organisation']
    const isDefaultTitleShown =
      validHeaderLocation.filter(s =>
        props.router.location.pathname.includes(s)
      ).length > 0
    if (isDefaultTitleShown) {
      setIsDefaultTitleState(true)
    } else {
      setIsDefaultTitleState(false)
    }
    if (props.router.location.pathname.includes('/template/')) {
      setIsInTemplate(true)
    } else {
      setIsInTemplate(false)
    }
    if (
      props.router.location.pathname.includes('/matters/') ||
      props.router.location.pathname.includes('/matteradmin/')
    ) {
      setIsInMatterSettings(true)
    } else {
      setIsInMatterSettings(false)
    }
  }, [props.router.location.pathname])

  const defaultTitle = (variant = 'body1', clientName = null) => (
    <>
      <Typography variant={variant}>
        {user.isExternal
          ? t('projectSelector.title_mattersOnly')
          : t('projectSelector.title')}
        {isInMatterSettings && clientName && `: ${clientName}`}
      </Typography>
      {props.open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
    </>
  )

  const spacing = (
    <Typography className={classes.breadcrumbSpacing} variant="subtitle1">
      &nbsp;&gt;&nbsp;
    </Typography>
  )

  if (isDefaultTitleState) {
    return (
      <div
        className={`${classes.titleContent} ${classes.defaultTitle}`}
        data-test="matter-switcher-closed"
        onClick={props.handleClick}
      >
        {defaultTitle('h6')}
      </div>
    )
  } else if (isInTemplate && templateName) {
    return (
      <div className={classes.titleContent}>
        <div
          className={`${classes.title}`}
          data-test="matter-switcher-closed"
          onClick={props.handleClick}
        >
          {defaultTitle()}
        </div>
        <div className={classes.breadcrumbWrapper}>
          <Typography className={classes.breadcrumb} variant="body2">
            {templateName}
          </Typography>
        </div>
      </div>
    )
  } else {
    return (
      <div className={classes.titleContent}>
        <div
          className={`${classes.title}`}
          data-test="matter-switcher-closed"
          onClick={props.handleClick}
        >
          {defaultTitle('body1', clientName)}
        </div>
        <div className={classes.breadcrumbWrapper}>
          <Typography
            className={classes.breadcrumb}
            variant="subtitle1"
            data-test="bread1"
          >
            {matterName}
          </Typography>
          {!isInMatterSettings && (
            <Typography
              className={classes.breadcrumb}
              variant="subtitle1"
              data-test="bread2"
            >
              {projectName}
            </Typography>
          )}
        </div>
      </div>
    )
  }
}

export default withRouter(MatterSwitcherHeaderButton)
