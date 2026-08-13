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

import { useMediaQuery } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { filterTasksBasedOnFilter } from '../../../services/helpers/task/task-util-helper'
import taskService from '../../../services/task/task-service'
import juralioTheme from '../../../theme/juralio-theme'
import TodoAndRecentlyViewedZeroState from '../zero-state/TodoAndRecentlyViewedZeroState'
import TodoFilter from './todo-filter/TodoFilter'
import { splitTodosByRange } from './todo-helper'
import TodoRangePicker from './todo-range-picker/TodoRangePicker'
import TodoTasks from './TodoTasks'

const style = makeStyles()(theme => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  skeleton: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: theme.spacing(),
  },
  zeroStateWrapper: {
    textAlign: 'center',
    alignItems: 'center',
    paddingTop: '35%',
    marginLeft: '10%',
    marginRight: '10%',
    pointerEvents: 'none',
  },
  zeroStateTitle: {
    marginBottom: theme.spacing(),
  },
  loadingWrapper: {
    width: theme.spacing(90),
  },
}))

const TodoContainer = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [todos, setTodos] = useState({ 0: [], 1: [], 2: [], 3: [] })
  const appUser = useSelector(state => state.auth.data.details)
  const [selectedRange, setSelectedRange] = useState(1)
  const [filter, setFilter] = useState('')
  const matters = useSelector(state => state.matters)
  const { t } = useTranslation()

  const rangeEnums = {
    0: t('home.todos.rangePicker.overdue'),
    1: t('home.todos.rangePicker.today'),
    2: t('home.todos.rangePicker.thisWeek'),
    3: t('home.todos.rangePicker.all'),
  }

  const { classes } = style()
  const isMobile = useMediaQuery(juralioTheme.breakpoints.down('md'))

  useEffect(() => {
    taskService.getTaskTodos(appUser.id).then(res => {
      if (res.status === 200) {
        setTodos(splitTodosByRange(res.body.filter(todo => todo !== null)))
      } else {
        setTodos({ 0: [], 1: [], 2: [], 3: [] })
      }
      setIsLoading(false)
    })
  }, [appUser.id]) //eslint-disable

  const handleOptionsUpdate = () => {
    taskService.getTaskTodos(appUser.id).then(res => {
      if (res.status === 200) {
        setTodos(splitTodosByRange(res.body))
      } else {
        setTodos({ 0: [], 1: [], 2: [], 3: [] })
      }
    })
  }

  const handleRangeChange = rangeKey => {
    setSelectedRange(parseInt(rangeKey))
  }

  const loadingState = () => {
    return (
      <>
        <TodoFilter
          setFilter={() => {}}
          filter={''}
          isLoading={true}
          context={'todo'}
        />
        <TodoRangePicker
          todos={todos}
          selectedRange={1}
          rangeEnums={rangeEnums}
          changeRange={() => {}}
          isLoading={true}
        />
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={classes.loadingWrapper}>
            <div className={classes.row}>
              <Skeleton
                className={classes.skeleton}
                variant="rect"
                width={80}
                height={20}
              />
              <Skeleton
                className={classes.skeleton}
                variant="rect"
                width={80}
                height={20}
              />
            </div>
            <div className={classes.row}>
              <Skeleton
                className={classes.skeleton}
                variant="rect"
                width={30}
                height={30}
              />
              <Skeleton
                className={classes.skeleton}
                variant="rect"
                width={400}
                height={30}
              />
            </div>
          </div>
        ))}
      </>
    )
  }

  if (isLoading) {
    return loadingState()
  }

  if (
    todos[0].length === 0 &&
    todos[1].length === 0 &&
    todos[2].length === 0 &&
    todos[3].length === 0
  ) {
    return <TodoAndRecentlyViewedZeroState noTasks={true} context={'todo'} />
  }

  const filteredTodos = filterTasksBasedOnFilter(
    filter,
    todos[selectedRange],
    matters
  )

  return (
    <>
      <TodoFilter setFilter={setFilter} filter={filter} context={'todo'} />
      <TodoRangePicker
        todos={todos}
        selectedRange={selectedRange}
        rangeEnums={rangeEnums}
        changeRange={handleRangeChange}
      />
      <TodoTasks
        tasks={filteredTodos}
        handleOptionsUpdate={handleOptionsUpdate}
        isMobile={isMobile}
        selectedRange={selectedRange}
        rangeEnums={rangeEnums}
      />
    </>
  )
}

export default TodoContainer
