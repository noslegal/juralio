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

import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import MatterResourceCosts from './MatterResourceCosts'
import BigDataSpinner from '../../../components/feedback/big-data-spinner/BigDataSpinner'
import { makeStyles } from 'tss-react/mui'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'

const useStyles = makeStyles()(theme => ({
  root: {
    backgroundColor: JuralioNamedColours.beige[100],
    height: '100%',
    borderRadius: theme.spacing(0.5),
  },
}))

const MatterCostsResourceContainer = props => {
  const { classes } = useStyles()
  const [stage, setStage] = useState(1)
  const fullPeriod = props.fullPeriod
  const matterId = props.matterId
  const orgId = useSelector(state => state.auth.data.details.organisationId)
  const [showSpinner, setShowSpinner] = useState(true)

  useEffect(() => {
    if (props.isSnapshot) {
      setStage(4)
    } else {
      let total = 0
      props.data.costTimeEstimateList.forEach(cte => {
        total += cte.hourValue
      })
      if (!props.data?.costRatioList.length > 0) {
        setStage(1)
      } else if (total === 0) {
        setStage(2)
      } else {
        setStage(4)
      }
    }
    setShowSpinner(false)
    //eslint-disable-next-line
  }, [])

  if (showSpinner) {
    return (
      <div className={classes.root}>
        <BigDataSpinner size={180} />
      </div>
    )
  } else {
    return (
      <div>
        <div>
          <MatterResourceCosts
            matterId={matterId}
            orgId={orgId}
            stage={stage}
            setStage={setStage}
            data={props.data}
            fullPeriod={fullPeriod}
            updateData={props.updateData}
            setIsExpanded={props.setIsExpanded}
            setCollapseData={props.setCollapseData}
            setPageInfo={props.setPageInfo}
            rtd={props.rtd}
            rates={props.rates}
            setTotalHours={props.setTotalHours}
            isSnapshot={props.isSnapshot}
            liveMode={props.liveMode}
            setIsCardOpen={props.setIsCardOpen}
            snapshotId={props.snapshotId}
            matterTasks={props.matterTasks}
            diffArray={props.diffArray}
            setMatterTasks={props.setMatterTasks}
            setLiveMode={props.setLiveMode}
          />
        </div>
      </div>
    )
  }
}
export default MatterCostsResourceContainer
