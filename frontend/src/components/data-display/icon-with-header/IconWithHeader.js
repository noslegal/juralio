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

const useStyles = makeStyles()(theme => ({
  header: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    justifyItems: 'center',
  },
  title: {
    paddingLeft: theme.spacing(1),
  },
}))

const IconWithHeader = props => {
  const { title, dataTest } = props
  const Icon = props.icon
  const { classes } = useStyles()

  return (
    <div className={classes.header}>
      <Icon />
      <Typography data-test={dataTest} variant={'h6'} className={classes.title}>
        {title}
      </Typography>
    </div>
  )
}

IconWithHeader.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired,
  dataTest: PropTypes.string.isRequired,
}

export default IconWithHeader
