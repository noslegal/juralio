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

import { Box, Tab, Tabs } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import CostsContainer from './CostsContainer'
//import costsService from '../../../../services/costs/costs-service'
import { POSITIONS } from '../../../constants'
import costsService from '../../../../services/costs/costs-service'
import { useNavigate } from 'react-router'

const styles = makeStyles()(theme => ({}))

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 1 }}>{children}</Box>}
    </div>
  )
}

const CostsWrapper = props => {
  const { router, organisation } = props
  const { classes } = styles()
  const [tabValue, setTabValue] = useState(0)
  const history = useNavigate()
  const [groupPositions, setGroupPositions] = useState([])

  const handleChange = (event, newValue) => {
    setTabValue(newValue)
    history(`/organisation/costs`, {
      state: {
        orgCostItem: 0,
      },
    })
  }

  useEffect(() => {
    costsService.getGroupPositions().then(res => {
      if (res.status === 200) {
        setGroupPositions(res.body)
      }
    })
  }, [])

  if (groupPositions.length === 0) {
    return <></>
  }

  return (
    <>
      <Tabs value={tabValue} onChange={handleChange}>
        <Tab label={'Client'} value={0}></Tab>
        <Tab label={'Advisor'} value={1}></Tab>
      </Tabs>
      <CustomTabPanel value={tabValue} index={0}>
        <CostsContainer
          router={router}
          organisationId={organisation?.id}
          position={groupPositions.find(x => x.name === POSITIONS.CLIENT.name)}
        />
      </CustomTabPanel>
      <CustomTabPanel value={tabValue} index={1}>
        <CostsContainer
          router={router}
          organisationId={organisation?.id}
          position={groupPositions.find(x => x.name === POSITIONS.ADVISOR.name)}
        />
      </CustomTabPanel>
    </>
  )
}
export default CostsWrapper
