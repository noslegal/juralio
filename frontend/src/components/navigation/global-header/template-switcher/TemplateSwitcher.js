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

import AddIcon from '@mui/icons-material/Add'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Button, Grow, Menu, MenuItem, Typography } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import { fetchTemplates } from '../../../../app/template-list/template-list-actions'
import { USER_ROLES } from '../../../../app/constants'
import { triggerCreateTemplateFlow } from '../../common/dialog-triggers/dialog-trigger-actions'
import juralioColours from '../../../../theme/juralio-colours'
import rawColours from '../../../../theme/raw-colours'
import TemplateSwitcherFilter from './TemplateSwitcherFilter'
import TemplateSwitcherList from './TemplateSwitcherList'
import { sortTemplatesByRecency, trackTemplateOpened } from './template-recency'

const FILTER_ALL = 0
const FILTER_ORG = 1
const FILTER_COMMUNITY = 2
const FILTER_DRAFTS = 3

const style = makeStyles()(theme => ({
  mask: {
    position: 'fixed',
    width: '100%',
    height: '100%',
    backgroundColor: juralioColours.darkText.secondary,
    left: 0,
    top: 0,
    zIndex: 100,
  },
  container: {
    position: 'absolute',
    left: 80,
  },
  switcherBody: {
    width: theme.spacing(60),
    backgroundColor: rawColours.primary.purple.secondary,
    borderRadius: `0px ${theme.spacing(0.5)} ${theme.spacing(
      0.5
    )} ${theme.spacing(0.5)}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  listWrapper: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    paddingRight: theme.spacing(2),
  },
  switcherTitle: {
    color: rawColours.primary.white.primary,
    marginLeft: theme.spacing(2.5),
    marginTop: theme.spacing(2),
    marginRight: 'auto',
    width: 'fit-content',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: `${theme.spacing(0.75)} ${theme.spacing(2)}`,
  },
  filterButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: rawColours.primary.white.primary,
    textTransform: 'none',
    alignSelf: 'stretch',
    minWidth: theme.spacing(15),
    flexShrink: 0,
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
  },
  filterButtonText: {
    fontSize: theme.spacing(1.5),
    color: rawColours.primary.white.primary,
  },
  footer: {
    flexShrink: 0,
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    backgroundColor: rawColours.primary.purple.secondary,
  },
  footerButton: {
    textTransform: 'none',
    background: 'white',
    color: rawColours.primary.purple[200],
  },
  footerButtonRight: {
    textTransform: 'none',
    background: 'white',
    color: rawColours.primary.purple[200],
    marginLeft: 'auto',
  },
}))

const TemplateSwitcher = props => {
  const { classes } = style()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [filteredIds, setFilteredIds] = useState(null)
  const [typeFilter, setTypeFilter] = useState(FILTER_ALL)
  const [anchorEl, setAnchorEl] = useState(null)
  const [height, setHeight] = useState(window.innerHeight)

  const templatesList = useSelector(state => state.templates)
  const selectedTemplate = useSelector(state => state.template.template)
  const userRoles = useSelector(state => state.auth.data.auth.roles)
  const isKnowledgeManager = userRoles.includes(
    USER_ROLES.ROLE_KNOWLEDGE_MANAGER
  )

  const filterTypeEnum = {
    [FILTER_ALL]: t('templates.filter.all'),
    [FILTER_ORG]: t('templates.filter.organisation'),
    [FILTER_COMMUNITY]: t('templates.filter.community'),
    [FILTER_DRAFTS]: t('templates.filter.drafts'),
  }

  const handleClickAwayRef = useRef(props.handleClickAway)
  useEffect(() => {
    handleClickAwayRef.current = props.handleClickAway
  })

  useEffect(() => {
    if (!templatesList.isLoaded) {
      dispatch(fetchTemplates())
    }
    const handleKeyDown = e => {
      if (e.key === 'Escape') handleClickAwayRef.current()
    }
    const handleResize = () => setHeight(window.innerHeight)
    document.addEventListener('keydown', handleKeyDown, false)
    window.addEventListener('resize', handleResize)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, false)
      window.removeEventListener('resize', handleResize)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isInTypeFilter = template => {
    switch (typeFilter) {
      case FILTER_ORG:
        return !template.isSystemTemplate
      case FILTER_COMMUNITY:
        return template.isSystemTemplate
      case FILTER_DRAFTS:
        return !template.isSystemTemplate && !template.published
      default:
        return true
    }
  }

  let templates = templatesList.isLoaded ? [...templatesList.templates] : []
  templates = templates.filter(isInTypeFilter)
  if (filteredIds !== null) {
    templates = templates.filter(tmpl => filteredIds.includes(tmpl.id))
  }
  templates = sortTemplatesByRecency(templates)

  const handleTemplateClick = template => {
    trackTemplateOpened(template.id)
    props.handleClickAway()
    navigate(`/template/${template.id}/overview`)
  }

  return (
    <div
      className={classes.mask}
      data-test="template-switcher-mask"
      onClick={props.handleClickAway}
    >
      <Grow in={true}>
        <div className={classes.container}>
          <div
            className={classes.switcherBody}
            onClick={e => e.stopPropagation()}
            style={{ height }}
          >
            <div className={classes.headerRow}>
              <Typography variant="h6" className={classes.switcherTitle}>
                {t('navigationLinks.templates')}
              </Typography>
            </div>
            <div className={classes.filterRow}>
              <Button
                className={classes.filterButton}
                data-test="template-switcher-type-filter"
                endIcon={<KeyboardArrowDownIcon />}
                onClick={e => {
                  e.stopPropagation()
                  setAnchorEl(e.currentTarget)
                }}
                size="small"
              >
                <Typography className={classes.filterButtonText}>
                  {filterTypeEnum[typeFilter]}
                </Typography>
              </Button>
              <TemplateSwitcherFilter
                setFilter={setFilteredIds}
                templates={templatesList.templates}
              />
            </div>
            <div className={classes.listWrapper}>
              <TemplateSwitcherList
                isLoaded={templatesList.isLoaded}
                templates={templates}
                selectedTemplateId={selectedTemplate?.id}
                onClick={handleTemplateClick}
              />
            </div>
            <div className={classes.footer}>
              {isKnowledgeManager && (
                <Button
                  data-test="create-new-template-card"
                  startIcon={<AddIcon />}
                  className={classes.footerButton}
                  onClick={() => {
                    dispatch(triggerCreateTemplateFlow())
                    props.handleClickAway()
                  }}
                >
                  {t('templateOverview.createNewTemplate')}
                </Button>
              )}
              <Button
                data-test="template-switcher-go-to-gallery"
                endIcon={<ArrowForwardIcon />}
                className={classes.footerButtonRight}
                onClick={() => {
                  props.handleClickAway()
                  navigate('/templates')
                }}
              >
                {t('templateOverview.goToTemplates')}
              </Button>
            </div>
          </div>
        </div>
      </Grow>
      {anchorEl && (
        <Menu
          open={true}
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          onClose={() => setAnchorEl(null)}
          onClick={e => e.stopPropagation()}
        >
          {Object.entries(filterTypeEnum)
            .filter(([k]) => parseInt(k) !== typeFilter)
            .map(([k, label]) => (
              <MenuItem
                key={k}
                data-test={`template-type-filter-${label
                  .toLowerCase()
                  .replace(' ', '')}`}
                onClick={() => {
                  setTypeFilter(parseInt(k))
                  setAnchorEl(null)
                }}
              >
                <Typography>{label}</Typography>
              </MenuItem>
            ))}
        </Menu>
      )}
    </div>
  )
}

export default TemplateSwitcher
