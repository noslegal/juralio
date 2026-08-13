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

import { Button, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { makeStyles } from 'tss-react/mui'
import ConfirmationDialog from '../../components/dialog/confirmation-dialog/ConfirmationDialog'
import { useTranslation } from 'react-i18next'
import matterCostsService from '../../services/costs/matter-costs-service'
import juralioColours from '../../theme/juralio-colours'

const style = makeStyles()(theme => ({
  container: { marginBottom: '4px', display: 'flex' },
  textField: { width: '100%' },
}))

const AssumptionDetails = props => {
  const {
    details,
    assumptionList,
    setAssumptions,
    index,
    isViewOnly,
    setFallBackList,
    scrollTo,
  } = props
  const [summary, setSummary] = useState('')
  const { classes } = style()
  const { t } = useTranslation()
  const [assumption, setAssumption] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (details.summary) {
      setSummary(details.summary)
    }
    if (details.assumption) {
      setAssumption(details.assumption)
    }
  }, [details.id]) //eslint-disable-line

  const validateSummary = () => {
    if (summary.length > 70) {
      return true
    } else {
      return false
    }
  }

  const validateAssumption = () => {
    if (assumption.length > 300) {
      return true
    } else {
      return false
    }
  }

  useEffect(() => {
    let elem = document.getElementById(`${scrollTo}`)
    if (elem) {
      elem.scrollIntoView({
        block: 'center',
      })
    }
  }, []) //eslint-disable-line

  return (
    <div>
      <div id={details.id} className={classes.container}>
        <TextField
          data-test="assumption-name"
          className={classes.textField}
          placeholder={t('matterCosts.assumptions.assumptionPlaceholder')}
          onChange={e => {
            if (e.target.value.length <= 70) {
              setSummary(e.target.value)
              let a = assumptionList
              a[index].summary = e.target.value
              setAssumptions([...a])
            }
          }}
          error={validateSummary()}
          defaultValue={details.summary}
          disabled={isViewOnly}
          multiline
          value={summary}
        ></TextField>
        {!isViewOnly && (
          <Button
            data-test="delete-assumption"
            onClick={() => {
              if (details.id) {
                setConfirmDelete(true)
              } else {
                let a = assumptionList
                a.splice(index, 1)
                setAssumptions([...a])
                setFallBackList([...a])
              }
            }}
          >
            <DeleteForeverIcon
              style={{ color: juralioColours.darkText.primary }}
            />
          </Button>
        )}
      </div>
      <TextField
        data-test="assumption-description"
        value={assumption}
        className={classes.textField}
        onChange={e => {
          if (e.target.value.length <= 300) {
            setAssumption(e.target.value)
            let a = assumptionList
            a[index].assumption = e.target.value
            setAssumptions([...a])
          }
        }}
        multiline
        variant="outlined"
        error={validateAssumption()}
        defaultValue={details.assumption}
        disabled={isViewOnly}
        helperText={`${assumption.length}/${300}`}
        slotProps={{
          // Use htmlInput to pass native attributes like maxLength
          htmlInput: {
            maxLength: 300,
          },
        }}
      />
      {confirmDelete && (
        <ConfirmationDialog
          // Stack above the editing Drawer (which sits at zIndex modal + 1),
          // otherwise the drawer overlay covers the confirm button.
          isKnockOnDialog={true}
          headerIcon={DeleteForeverIcon}
          titleText={t('matterCosts.assumptions.deleteAssumption')}
          promptText={t('matterCosts.assumptions.deleteAssumptionText')}
          actionText={t('common.delete')}
          cancelHandler={() => {
            setConfirmDelete(false)
          }}
          actionHandler={() => {
            matterCostsService
              .deleteAssumption(details.matter.id, details.id)
              .then(res => {
                let a = assumptionList
                a.splice(index, 1)
                setAssumptions([...a])
                setFallBackList([...a])
                setConfirmDelete(false)
              })
          }}
          warningText={null}
        />
      )}
    </div>
  )
}
export default AssumptionDetails
