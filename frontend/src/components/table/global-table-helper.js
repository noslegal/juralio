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

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  Button,
  Checkbox,
  Divider,
  IconButton,
  InputAdornment,
  ListItemText,
  MenuItem,
  MenuList,
  Popover,
  TextField,
  Typography,
} from '@mui/material'
import { GridToolbarContainer } from '@mui/x-data-grid'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const activeFilterCount = filterValues =>
  Object.values(filterValues ?? {}).filter(v => v?.length > 0).length

const ExpandableSearch = ({ value, onChange }) => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(!!value)
  const inputRef = useRef(null)

  const handleExpand = () => {
    setExpanded(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const handleBlur = () => {
    if (!value) setExpanded(false)
  }

  return (
    <TextField
      inputRef={inputRef}
      size="small"
      variant="standard"
      placeholder={expanded ? t('common.search') : ''}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setExpanded(true)}
      onBlur={handleBlur}
      sx={{
        width: expanded ? 200 : 28,
        transition: 'width 0.25s ease',
        overflow: 'hidden',
        '& .MuiInputBase-input': {
          p: 0,
          width: expanded ? undefined : 0,
          cursor: expanded ? 'text' : 'pointer',
        },
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <IconButton
                size="small"
                onClick={handleExpand}
                disableRipple
                data-test="search-button"
              >
                <SearchIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
          disableUnderline: !expanded,
        },

        htmlInput: { 'data-test': 'Search' },
      }}
    />
  )
}

const FilterPopoverContent = ({ filters, filterValues, onChange, onClear }) => {
  const { t } = useTranslation()
  return (
    <div style={{ minWidth: 280, display: 'flex', flexDirection: 'column' }}>
      {filters.map(f => {
        const selected = filterValues[f.name] ?? []
        return (
          <Accordion key={f.name} disableGutters elevation={0} square>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                {f.label}
              </Typography>
              {selected.length > 0 && (
                <Badge
                  badgeContent={selected?.length}
                  color="primary"
                  sx={{ ml: 2, mt: 0.5 }}
                />
              )}
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <MenuList dense>
                {f.options.map(opt => (
                  <MenuItem
                    key={opt}
                    dense
                    data-test={`filter-${f.name}-${opt}`}
                    onClick={() => {
                      const newVal = selected.includes(opt)
                        ? selected.filter(v => v !== opt)
                        : [...selected, opt]
                      onChange(f.name, newVal)
                    }}
                  >
                    <Checkbox
                      color="primary"
                      checked={selected.includes(opt)}
                      size="small"
                    />
                    <ListItemText
                      primary={opt}
                      slotProps={{
                        primary: { fontSize: '0.8125rem' },
                      }}
                    />
                  </MenuItem>
                ))}
              </MenuList>
            </AccordionDetails>
          </Accordion>
        )
      })}
      <Divider />
      <Button
        onClick={onClear}
        disabled={activeFilterCount(filterValues) === 0}
        data-test="clear-filters-button"
        sx={{ m: 1, fontSize: '0.8125rem' }}
      >
        {t('common.clearAll')}
      </Button>
    </div>
  )
}

const FilterButton = ({ filters, filterValues, onChange, onClear }) => {
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = useState(null)
  const count = activeFilterCount(filterValues)
  return (
    <>
      <Button
        size="small"
        startIcon={
          <Badge badgeContent={count} color="primary">
            <FilterListIcon />
          </Badge>
        }
        onClick={e => setAnchorEl(e.currentTarget)}
        data-test="open-filters-button"
        sx={{ fontSize: '0.8125rem' }}
      >
        {t('common.filters')}
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <FilterPopoverContent
          filters={filters}
          filterValues={filterValues}
          onChange={onChange}
          onClear={onClear}
        />
      </Popover>
    </>
  )
}

export const CustomToolbar = ({
  filters,
  filterValues,
  onFilterChange,
  onFilterClear,
  quickFilterValue,
  onQuickFilterChange,
  hideSearch,
}) => {
  const hasFilters = filters && filters.length > 0
  return (
    <GridToolbarContainer>
      <ExpandableSearch
        value={quickFilterValue ?? ''}
        onChange={onQuickFilterChange ?? (() => {})}
      />
      {hasFilters && (
        <FilterButton
          filters={filters}
          filterValues={filterValues}
          onChange={onFilterChange}
          onClear={onFilterClear}
        />
      )}
    </GridToolbarContainer>
  )
}
