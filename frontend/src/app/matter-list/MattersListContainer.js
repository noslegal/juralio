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

import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { updateMatterDetails } from '../matter-details/matter-details-actions'
import { updateSingleMatter } from '../matter-list/matter-list-actions'
import MattersList from './MattersList'
import OrgMatterInfo from './OrgMatterInfo'
import { Paper } from '@mui/material'

const MattersListContainer = props => {
  const dispatch = useDispatch()
  const [selectedMatter, setSelectedMatter] = useState()

  return selectedMatter ? (
    <Paper style={{ padding: '24px' }}>
      <OrgMatterInfo
        selectedMatter={selectedMatter}
        setSelectedMatter={setSelectedMatter}
      />
    </Paper>
  ) : (
    <Paper style={{ padding: '24px' }}>
      <MattersList
        setSelectedMatter={setSelectedMatter}
        selectedMatter={selectedMatter}
        updateMatter={(id, data) => {
          return dispatch(updateMatterDetails(id, data)).then(res => {
            dispatch(updateSingleMatter(id, data))
            return res
          })
        }}
      />
    </Paper>
  )
}

export default MattersListContainer
