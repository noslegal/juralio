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

import { TextField } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'

const styles = makeStyles()(theme => ({
  input: {
    width: '-webkit-fill-available',
    marginTop: theme.spacing(),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  loadingSkeleton: {
    width: '-webkit-fill-available',
    marginTop: theme.spacing(),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    height: theme.spacing(4),
  },
}))
const TodoFilter = props => {
  const { classes } = styles()
  const { t } = useTranslation()
  if (props.isLoading) {
    return <Skeleton className={classes.loadingSkeleton} />
  }
  return (
    <TextField
      className={classes.input}
      data-test={`${props.context}-filter`}
      placeholder={t('home.todos.filter')}
      value={props.filter}
      onChange={e => props.setFilter(e.target.value.toLowerCase())}
      autoFocus={props?.autoFocus}
    />
  )
}
export default TodoFilter
