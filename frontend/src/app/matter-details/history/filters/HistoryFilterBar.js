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

import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
} from '@mui/material'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { formatUserDisplayName } from '../../../../services/user/helper/user-format-service'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    alignItems: 'flex-end',
    marginBottom: theme.spacing(3),
  },
  control: {
    minWidth: theme.spacing(22),
  },
  dateField: {
    minWidth: theme.spacing(18),
    backgroundColor: theme.palette.common.white,
  },
}))

// Converts a picker Date to epoch millis at the start (or end) of that day.
const toEpoch = (value, endOfDay = false) => {
  if (!value || Number.isNaN(value.getTime())) return null
  const date = new Date(value)
  if (endOfDay) {
    date.setHours(23, 59, 59, 999)
  } else {
    date.setHours(0, 0, 0, 0)
  }
  return date.getTime()
}

const toDateValue = epoch => (epoch ? new Date(epoch) : null)

const HistoryFilterBar = ({ filters, filterOptions, onFilterChange }) => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  const updateFilter = patch => onFilterChange({ ...filters, ...patch })

  const invalidDateRange =
    !!filters.fromDate && !!filters.toDate && filters.fromDate > filters.toDate

  const hasActiveFilters =
    (filters.categories && filters.categories.length > 0) ||
    (filters.performedByIds && filters.performedByIds.length > 0) ||
    filters.fromDate ||
    filters.toDate

  const clearFilters = () => {
    onFilterChange({
      categories: [],
      performedByIds: [],
      fromDate: null,
      toDate: null,
    })
  }

  return (
    <Box className={classes.root} data-test="history-filter-bar">
      <FormControl className={classes.control} size="small">
        <InputLabel>{t('matterHistory.filters.events')}</InputLabel>
        <Select
          multiple
          value={filters.categories || []}
          onChange={e => updateFilter({ categories: e.target.value })}
          input={<OutlinedInput label={t('matterHistory.filters.events')} />}
          renderValue={selected =>
            selected.map(c => t(`matterHistory.categories.${c}`)).join(', ')
          }
          data-test="history-event-filter"
        >
          {(filterOptions.categories || []).map(category => (
            <MenuItem key={category} value={category}>
              <Checkbox
                checked={(filters.categories || []).indexOf(category) > -1}
              />
              <ListItemText
                primary={t(`matterHistory.categories.${category}`)}
              />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl className={classes.control} size="small">
        <InputLabel>{t('matterHistory.filters.people')}</InputLabel>
        <Select
          multiple
          value={filters.performedByIds || []}
          onChange={e => updateFilter({ performedByIds: e.target.value })}
          input={<OutlinedInput label={t('matterHistory.filters.people')} />}
          renderValue={selected =>
            selected
              .map(id => {
                const person = (filterOptions.people || []).find(
                  p => p.id === id
                )
                return person
                  ? formatUserDisplayName({
                      firstname: person.firstName,
                      lastname: person.lastName,
                    })
                  : id
              })
              .join(', ')
          }
          data-test="history-people-filter"
        >
          {(filterOptions.people || []).map(person => (
            <MenuItem key={person.id} value={person.id}>
              <Checkbox
                checked={(filters.performedByIds || []).indexOf(person.id) > -1}
              />
              <ListItemText
                primary={formatUserDisplayName({
                  firstname: person.firstName,
                  lastname: person.lastName,
                })}
              />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <MobileDatePicker
        label={t('matterHistory.filters.from')}
        format="d MMM yyyy"
        value={toDateValue(filters.fromDate)}
        onChange={date => updateFilter({ fromDate: toEpoch(date) })}
        slotProps={{
          textField: {
            size: 'small',
            className: classes.dateField,
            'data-test': 'history-from-date',
          },
          field: { clearable: true },
        }}
      />
      <MobileDatePicker
        label={t('matterHistory.filters.to')}
        format="d MMM yyyy"
        value={toDateValue(filters.toDate)}
        onChange={date => updateFilter({ toDate: toEpoch(date, true) })}
        slotProps={{
          textField: {
            size: 'small',
            className: classes.dateField,
            error: invalidDateRange,
            helperText: invalidDateRange
              ? t('matterHistory.filters.dateRangeError')
              : undefined,
            'data-test': 'history-to-date',
          },
          field: { clearable: true },
        }}
      />

      {hasActiveFilters && (
        <Button onClick={clearFilters} data-test="history-clear-filters">
          {t('matterHistory.filters.clear')}
        </Button>
      )}
    </Box>
  )
}

export default HistoryFilterBar
