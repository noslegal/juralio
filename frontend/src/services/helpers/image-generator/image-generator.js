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

import React, { useEffect, useState } from 'react'
import projectService from '../../project/project-service'
import templateService from '../../template/template-service'
import ZeroState from './zero-state.svg'
//height = number of children with no children (leafs)
let TASK_CELL_HEIGHT = 16

const ImageGenerator = props => {
  const [testData, setTestData] = useState([])
  useEffect(() => {
    let isCancelled = false
    if (props.matterId) {
      projectService.getPreview(props.matterId, props.projectId).then(res => {
        if (!isCancelled) {
          setTestData(res.body)
        }
      })
    }
    if (props.templateId) {
      templateService.getPreview(props.templateId).then(res => {
        if (!isCancelled) {
          setTestData(res.body)
        }
      })
    }

    return () => {
      isCancelled = true
    }
  }, [props.matterId, props.projectId, props.templateId])

  const taskHeightCount =
    testData.length === 0
      ? 16
      : testData.map(task => task.height).reduce((a, b) => a + b)

  TASK_CELL_HEIGHT = Math.min(16, props.height / taskHeightCount)

  let depths = testData.map(task => task.depth)
  let width = 0
  if (props.anchor.current) {
    width =
      depths.length === 0
        ? (props.anchor.current.clientWidth - 8) * 0.6
        : (props.anchor.current.clientWidth - 8) / (Math.max(...depths) + 2)
  }

  const renderRow = (row, i) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div
          style={{
            height: `${TASK_CELL_HEIGHT * row.height}px`,
            width: `${width}px`,
            marginLeft: `${i * 100}px`,
          }}
        >
          <div
            style={{
              width: '90%',
              height: 'calc(100% - 4px)',
              borderRadius: '2px',
              backgroundColor: props.templateId ? '#cec9ed' : 'red',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {}
          {row.children && row.children.map((child, j) => renderRow(child, 0))}
        </div>
      </div>
    )
  }

  if (testData.length === 0 || width === 0) {
    return (
      <img
        src={ZeroState}
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: 'auto',
          marginBottom: 'auto',
        }}
        alt="template-zero-state"
      />
    )
  }

  return (
    <div
      style={{
        maxHeight: `${props.height}px`,
        margin: '4px',
      }}
    >
      {}
      {testData.map((row, i) => renderRow(row, 0))}
    </div>
  )
}

export default ImageGenerator
