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
import {
  ListItem,
  List,
  Paper,
  Checkbox,
  FormControlLabel,
  Divider,
  Tooltip,
} from '@mui/material'
import TemplatePostResult from './TemplatePostResult'
import { makeStyles } from 'tss-react/mui'
import colorModifiers from '../../../../theme/color-modifiers'
import rawColours from '../../../../theme/raw-colours'
import { Typography } from '@mui/material'
import TaskResult from './TaskResult'
import MatterResult from './MatterResult'
import PostResult from './PostResult'
import WorkstreamResult from './WorkstreamResult'
import TemplateResult from './TemplateResult'
import TemplateTaskResult from './TemplateTaskResult'
import { useTranslation } from 'react-i18next'
import RenderIfVisible from '../../../../app/improved-taskmap/taskmap-helpers/render-if-visible'
import ToggleButton from '@mui/material/ToggleButton'
import {
  MattersIcon,
  TemplatesIcon,
  WorkstreamIcon,
} from '../../../../theme/navigation/CommonIcons'
import InfoIcon from '@mui/icons-material/Info'

const style = makeStyles()(theme => ({
  listItem: {
    cursor: 'pointer',
    width: '100%',
    paddingTop: '2px',
    paddingBottom: '2px',
    '&:hover': {
      backgroundColor: colorModifiers.secondaryBackground(
        rawColours.primary.grey[200]
      ),
    },
  },
  list: {
    width: '100%',
    overflow: 'auto',
  },
  popover: {
    top: 88,
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1004,
    justifyContent: 'center',
  },
  button: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
    height: theme.spacing(5),
  },
  dot: {
    animation: '1s fadeinout infinite',
    background: rawColours.primary.blue.dark,
    height: theme.spacing(1.25),
    width: theme.spacing(1.25),
    borderRadius: '5px',
    marginTop: 'auto',
    marginLeft: '2px',
  },
  loadingText: {
    display: 'flex',
  },
  filterWrapper: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    background: colorModifiers.secondaryBackground(
      rawColours.primary.black[100]
    ),
  },
  toggleButton: {
    marginLeft: theme.spacing(1.25),
    marginRight: theme.spacing(1.25),
    height: 30,
    borderRadius: theme.spacing(2.5),
    marginBottom: theme.spacing(),
    marginTop: theme.spacing(),
  },
  resultCount: {
    marginLeft: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
    marginRight: theme.spacing(),
  },
  filterText: {
    color: 'white',
    textTransform: 'capitalize',
  },
}))

const resultTypes = {
  templatePost: 'templatePost',
  task: 'task',
  matter: 'matter',
  post: 'post',
  workstream: 'workstream',
  template: 'template',
  templateTask: 'templateTask',
}

const LoadingItem = () => {
  const { classes } = style()
  const { t } = useTranslation()
  return (
    <ListItem>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <Typography variant={'h5'} className={classes.loadingText}>
          {t('globalSearch.searching')}
          <div className={classes.dot} />
          <div className={classes.dot} style={{ animationDelay: '250ms' }} />
          <div className={classes.dot} style={{ animationDelay: '500ms' }} />
        </Typography>
      </div>
    </ListItem>
  )
}

const NoResults = props => {
  const { classes } = style()
  const { t } = useTranslation()
  return (
    <RenderIfVisible>
      <ListItem>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
          data-test="no-results-search"
        >
          <Typography variant={'h5'} className={classes.loadingText}>
            {props.text ? props.text : t('globalSearch.noResults')}
          </Typography>
        </div>
      </ListItem>
    </RenderIfVisible>
  )
}

const Filter = props => {
  const { searchMatter, setSearchMatter } = props
  const { classes } = style()
  const { t } = useTranslation()
  const noContext = Object.keys(props.context).length === 0
  let mattersSelected = props.values.includes('matter')
  let tasksSelected = props.values.includes('task')
  let postsSelected = props.values.includes('post')
  let templatesSelected = props.values.includes('template')

  return (
    <div className={classes.filterWrapper}>
      {(noContext || !searchMatter) && (
        <ToggleButton
          className={classes.toggleButton}
          value="matter"
          style={{
            backgroundColor: mattersSelected
              ? rawColours.primary.primary.main
              : '',
          }}
          selected={mattersSelected}
          onClick={() => props.onFilterChange('matter')}
        >
          {props.context.contextType === 'matter' ? (
            <WorkstreamIcon
              style={{
                color: mattersSelected ? 'white' : 'black',
                marginRight: '5px',
              }}
            />
          ) : (
            <MattersIcon
              style={{
                color: mattersSelected ? 'white' : 'black',
                marginRight: '5px',
              }}
            />
          )}

          <Typography
            className={classes.filterText}
            style={{ color: mattersSelected ? '' : 'black' }}
          >
            {props.context.contextType === 'matter' && searchMatter
              ? t('common.workstreams')
              : t('common.matters')}
          </Typography>
        </ToggleButton>
      )}

      {!noContext && (
        <ToggleButton
          className={classes.toggleButton}
          value="search matter"
          selected={searchMatter}
          onClick={() => {
            if (searchMatter) {
              setSearchMatter(false)
              props.searchEverywhere()
            } else {
              props.searchContext()
              setSearchMatter(true)
            }
          }}
          style={{
            backgroundColor: searchMatter
              ? rawColours.primary.primary.main
              : '',
          }}
        >
          {props.context.contextType === 'template' ? (
            <TemplatesIcon
              style={{
                color: searchMatter ? 'white' : 'black',
                marginRight: '5px',
              }}
            />
          ) : (
            <MattersIcon
              style={{
                color: searchMatter ? 'white' : 'black',
                marginRight: '5px',
              }}
            />
          )}

          <Typography
            className={classes.filterText}
            style={{ color: searchMatter ? '' : 'black' }}
          >
            {props.context.contextType === 'template'
              ? 'In template'
              : 'In matter'}
          </Typography>
        </ToggleButton>
      )}

      {(noContext || !searchMatter) && (
        <ToggleButton
          className={classes.toggleButton}
          value="template"
          selected={templatesSelected}
          onClick={() => props.onFilterChange('template')}
          style={{
            backgroundColor: templatesSelected
              ? rawColours.primary.primary.main
              : '',
          }}
        >
          <TemplatesIcon
            style={{
              color: templatesSelected ? 'white' : 'black',
              marginRight: '5px',
            }}
          />
          <Typography
            className={classes.filterText}
            style={{ color: templatesSelected ? '' : 'black' }}
          >
            {t('common.templates')}
          </Typography>
        </ToggleButton>
      )}
      <div style={{ marginRight: '12px' }}>
        <Divider orientation="vertical" />
      </div>

      <FormControlLabel
        control={
          <Checkbox
            onClick={() => props.onFilterChange('task')}
            color="primary"
            checked={tasksSelected}
          />
        }
        label={t('common.tasks')}
      ></FormControlLabel>

      <FormControlLabel
        control={
          <Checkbox
            onClick={() => props.onFilterChange('post')}
            color="primary"
            checked={postsSelected}
          />
        }
        label={t('common.posts')}
      ></FormControlLabel>
      <Tooltip title={t('globalSearch.searchTooltip')}>
        <div
          style={{
            marginLeft: 'auto',
            marginRight: '12px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography className={classes.resultCount}>
            Showing {props.filteredCount} / {props.resultCount}
          </Typography>
          <InfoIcon fontSize="small" />
        </div>
      </Tooltip>
    </div>
  )
}

const ResultsContainer = props => {
  const { classes } = style()
  const { t } = useTranslation()
  const results = props.results
  const noContext = Object.keys(props.context).length === 0
  const [searchMatter, setSearchMatter] = useState()

  useEffect(() => {
    //needed to fix issue of always being reset to default state
    if (noContext) {
      setSearchMatter(false)
    } else {
      setSearchMatter(true)
    }
    //eslint-disable-next-line
  }, [])

  const [includeFilterValues, setFilterIncludeValues] = useState([
    'matter',
    'task',
    'post',
    'template',
  ])

  const onFilterchange = value => {
    if (includeFilterValues.includes(value)) {
      //remove
      setFilterIncludeValues(includeFilterValues.filter(v => v !== value))
    } else {
      setFilterIncludeValues([...includeFilterValues, value])
    }
  }

  useEffect(() => {
    if (props.context.contextType === 'template') {
      setFilterIncludeValues(includeFilterValues.filter(v => v !== 'matter'))
    } else if (props.context.contextType === 'matter') {
      setFilterIncludeValues(includeFilterValues.filter(v => v !== 'template'))
    }
    //eslint-disable-next-line
  }, [])

  const getResultEntry = result => {
    switch (result.type) {
      case resultTypes.templatePost:
        return (
          <TemplatePostResult
            result={result}
            close={props.onClose}
            query={props.query}
          />
        )
      case resultTypes.task:
        return (
          <TaskResult
            result={result}
            close={props.onClose}
            query={props.query}
          />
        )
      case resultTypes.matter:
        return (
          <MatterResult
            result={result}
            close={props.onClose}
            query={props.query}
          />
        )
      case resultTypes.post:
        return (
          <PostResult
            result={result}
            close={props.onClose}
            query={props.query}
          />
        )
      case resultTypes.workstream:
        return (
          <WorkstreamResult
            result={result}
            close={props.onClose}
            query={props.query}
          />
        )
      case resultTypes.template:
        return (
          <TemplateResult
            result={result}
            close={props.onClose}
            query={props.query}
          />
        )
      case resultTypes.templateTask:
        return (
          <TemplateTaskResult
            result={result}
            close={props.onClose}
            query={props.query}
          />
        )
      default:
        return result.type
    }
  }

  const filteredResults = props.results.filter(r => {
    if (!includeFilterValues.includes('matter')) {
      return (
        (r.type === 'templateTask' &&
          includeFilterValues.includes('template') &&
          includeFilterValues.includes('task')) ||
        (r.type === 'templatePost' &&
          includeFilterValues.includes('template') &&
          includeFilterValues.includes('post'))
      )
    }
    if (
      !includeFilterValues.includes('post') &&
      !includeFilterValues.includes('task')
    ) {
      return (
        (r.type === 'workstream' && includeFilterValues.includes('matter')) ||
        (r.type === 'template' && includeFilterValues.includes('template')) ||
        (r.type === 'matter' && includeFilterValues.includes('matter'))
      )
    }

    return (
      includeFilterValues.includes(r.type) ||
      (r.type === 'workstream' && includeFilterValues.includes('matter')) ||
      (r.type === 'templateTask' &&
        includeFilterValues.includes('template') &&
        includeFilterValues.includes('task')) ||
      (r.type === 'templatePost' &&
        includeFilterValues.includes('template') &&
        includeFilterValues.includes('post'))
    )
  })
  if (results.length < 1 && !props.loading && !props.noResults) {
    return null
  }

  let width = document
    .getElementById('search-component')
    .getBoundingClientRect().width

  return (
    <Paper
      className={classes.popover}
      style={{ width: width }}
      open={results.length > 1 || props.loading}
      anchorEl={props.anchor}
      PaperProps={{ style: { display: 'flex', flexDirection: 'column' } }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      id="global-search-results-container"
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      {!props.loading && props.results.length > 0 && (
        <Filter
          context={props.context}
          onFilterChange={onFilterchange}
          values={includeFilterValues}
          resultCount={props.results.length}
          filteredCount={filteredResults.length}
          searchEverywhere={props.searchEverywhere}
          searchContext={props.searchContext}
          searchMatter={searchMatter}
          setSearchMatter={setSearchMatter}
        />
      )}
      <List
        className={classes.list}
        style={{ maxHeight: window.innerHeight - 350 }}
        data-test="search-results-list"
      >
        {!props.loading &&
          filteredResults.map(result => {
            return (
              <RenderIfVisible>
                <ListItem
                  className={classes.listItem}
                  data-test="search-result-item"
                >
                  {getResultEntry(result)}
                </ListItem>
                <Divider />
              </RenderIfVisible>
            )
          })}
        {props.loading ? <LoadingItem /> : null}
      </List>
      {filteredResults.length === 0 && props.results.length > 0 && (
        <NoResults text={t('globalSearch.allResultsFilteredOut')} />
      )}

      {!props.loading && props.noResults && <NoResults />}
    </Paper>
  )
}

export default ResultsContainer
