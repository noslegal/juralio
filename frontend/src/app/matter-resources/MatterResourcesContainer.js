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
import AddResourceDialog from './AddResourceDialog'
import MatterResources from './MatterResources'

const MatterResourcesContainer = props => {
  const [showResourceDialog, setShowResourceDialog] = useState(false)
  return (
    <>
      <MatterResources
        openAddResourceDialog={() => setShowResourceDialog(true)}
        projectId={props.projectId}
        matterId={props.matterId}
        isTemplate={props.isTemplate}
        isSystemTemplate={props.isSystemTemplate}
      />
      {showResourceDialog && (
        <AddResourceDialog
          showResourceDialog={showResourceDialog}
          setShowResourceDialog={setShowResourceDialog}
          matterId={props.matterId}
          projectId={props.projectId}
          isTemplate={props.isTemplate}
        />
      )}
    </>
  )
}

export default MatterResourcesContainer
