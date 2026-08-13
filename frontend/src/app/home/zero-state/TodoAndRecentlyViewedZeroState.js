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
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import zeroStateImage from '../../../assets/images/Mountain.png'

const styles = makeStyles()(theme => ({
  wrapper: {
    height: 'calc(100% - 50px)',
    backgroundImage: `url(${zeroStateImage})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: ' center bottom',
    display: 'flex',
    width: '98%',
  },
  text: {
    marginTop: 'auto',
    marginBottom: '100%',
    marginLeft: '10%',
    marginRight: '10%',
    textAlign: 'center',
    whiteSpace: 'pre-line',
    width: '100%',
  },
}))
const TodoAndRecentlyViewedZeroState = props => {
  const { t } = useTranslation()
  const { classes } = styles()
  const getZeroStateText = () => {
    if (props.noTasks) {
      return t('home.todos.zeroState.empty')
    }
    if (props.noSearchResults) {
      return t('common.noSearchResults')
    }
    switch (props.selectedRange) {
      case 0:
        return t('home.todos.zeroState.overdue')
      case 1:
        return t('home.todos.zeroState.today')
      case 2:
        return t('home.todos.zeroState.thisWeek')
      default:
        return t('home.todos.zeroState.empty')
    }
  }
  return (
    <div
      className={classes.wrapper}
      data-test={`${props.context}-zero-state`}
      style={{
        height: props.noTasks ? '105%' : props.noSearchResults ? '110%' : null,
      }}
    >
      <Typography className={classes.text}>{getZeroStateText()}</Typography>
    </div>
  )
}
export default TodoAndRecentlyViewedZeroState
