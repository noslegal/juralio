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

import React, { useEffect, useRef, useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import taskService from '../../services/task/task-service'
import RecentlyViewedContainer from './recently-viewed/RecentlyViewedMatterList'
import TodoContainer from './todos/TodoContainer'

const style = makeStyles()(theme => ({
  wrapper: {
    height: `calc(100% - ${theme.spacing(11)})`,
  },
}))

const TodoAndRecentContainer = props => {
  const { classes } = style()
  const [recentTasks, setRecentTasks] = useState([])
  const [isLoadingRecents, setIsLoadingRecents] = useState(true)
  const [expandedMatterId, setExpandedMatterId] = useState(null)
  const mountedRef = useRef(true)

  const { selectedTab } = props

  const handleMatterExpand = matterId => {
    setExpandedMatterId(matterId)
  }

  useEffect(() => {
    taskService.getRecentTasks().promise.then(response => {
      if (!mountedRef.current) return null
      if (response.status === 200) {
        setRecentTasks(response.body)
        if (response.body.length > 0) {
          setExpandedMatterId(response.body[0].matterId)
        }
      }
      setIsLoadingRecents(false)
    })
    return () => {
      mountedRef.current = false
    }
  }, [])

  return (
    <div className={classes.wrapper}>
      {selectedTab === 0 ? (
        <TodoContainer />
      ) : (
        <RecentlyViewedContainer
          recentTasks={recentTasks}
          isLoading={isLoadingRecents}
          expandedMatterId={expandedMatterId}
          handleMatterExpand={handleMatterExpand}
        />
      )}
    </div>
  )
}

export default TodoAndRecentContainer
