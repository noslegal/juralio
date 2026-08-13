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

import { Button } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../../theme/raw-colours'
import juralioColours from '../../../../theme/juralio-colours'

const styles = makeStyles()(theme => ({
  button: {
    textTransform: 'none',
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    color: juralioColours.darkText.secondary,
    '&:hover': {
      color: rawColours.primary.grey.main,
      backgroundColor: rawColours.primary.black[200],
    },
  },
}))

const OrgCostsSubHeader = props => {
  const { classes } = styles()
  const history = useNavigate()
  const { t } = useTranslation()

  const [selectedItem, setSelectedItem] = useState(
    props.router?.location?.state?.orgCostItem >= 0
      ? props.router?.location?.state?.orgCostItem
      : 7
  )

  return (
    <div>
      <Button
        data-test="rate-tables"
        style={
          selectedItem === 7
            ? {
                backgroundColor: rawColours.primary.black[200],
                color: rawColours.primary.grey.main,
              }
            : {}
        }
        className={classes.button}
        onClick={() => {
          setSelectedItem(7)
          history(`/organisation/costs`, {
            state: {
              orgCostItem: 7,
            },
          })
        }}
      >
        {t('organisationAdmin.costs.buildingBlocks.rateTable')}
      </Button>
      <Button
        data-test="grades"
        style={
          selectedItem === 9
            ? {
                backgroundColor: rawColours.primary.black[200],
                color: rawColours.primary.grey.main,
              }
            : {}
        }
        className={classes.button}
        onClick={() => {
          setSelectedItem(9)
          history(`/organisation/costs`, {
            state: {
              orgCostItem: 9,
            },
          })
        }}
      >
        {t('organisationAdmin.costs.buildingBlocks.grades')}
      </Button>
      <Button
        data-test="rate-types"
        style={
          selectedItem === 10
            ? {
                backgroundColor: rawColours.primary.black[200],
                color: rawColours.primary.grey.main,
              }
            : {}
        }
        className={classes.button}
        onClick={() => {
          setSelectedItem(10)
          history(`/organisation/costs`, {
            state: {
              orgCostItem: 10,
            },
          })
        }}
      >
        {t('organisationAdmin.costs.buildingBlocks.rateTypes')}
      </Button>
      <Button
        data-test="other-costs"
        style={
          selectedItem === 11
            ? {
                backgroundColor: rawColours.primary.black[200],
                color: rawColours.primary.grey.main,
              }
            : {}
        }
        className={classes.button}
        onClick={() => {
          setSelectedItem(11)
          history(`/organisation/costs`, {
            state: {
              orgCostItem: 11,
            },
          })
        }}
      >
        {t('organisationAdmin.costs.buildingBlocks.otherCosts')}
      </Button>
    </div>
  )
}

export default OrgCostsSubHeader
