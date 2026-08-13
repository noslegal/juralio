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

import { Grow } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { fetchMatters } from '../../../../../app/matter-list/matter-list-actions'
import { fetchTemplates } from '../../../../../app/template-list/template-list-actions'
import withRouter from '../../../../../services/navigation/WithRouter'
import juralioColours from '../../../../../theme/juralio-colours'
import MatterSwitcherFilter from '../filter/MatterSwitcherFilter'
import MatterList from '../MattersList'
import MatterDetails from './MatterDetails'
import MatterSwitcherOpenHeader from './MatterSwitcherOpenHeader'
import TemplatesList from './TemplateList'

const style = makeStyles()(theme => ({
  container: {
    position: 'absolute',
    top: theme.spacing(0),
    left: theme.spacing(0),
    zIndex: 1301,
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderBottom: `1px solid ${juralioColours.control.border}`,
  },
  searchContainer: {
    height: theme.spacing(10),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  searchContainerScrollShadow: {
    boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.15)',
  },
}))

const MatterSwitcher = props => {
  const { classes } = style()
  const dispatch = useDispatch()
  const [mattersOpen, setMattersOpen] = useState(true)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [selectedMatterId, setSelectedMatterId] = useState(null)
  const [selectedMatterToTop, setSelectedMatterToTop] = useState(false)
  const isLoaded = useSelector(state => state.matters.isLoaded)
  const matters = useSelector(state => state.matters.matters)
  const templates = useSelector(state => state.templates)
  const selectedTemplate = useSelector(state => state.template.template)
  const isExternal = useSelector(state => state.auth.data.details.isExternal)
  const [filteredMatterIds, setFilteredMatterIds] = useState(null)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (props.router.location.pathname.includes('template')) {
      setMattersOpen(false)
      setTemplatesOpen(true)
    }
  }, []) //eslint-disable-line

  useEffect(() => {
    dispatch(fetchMatters())
  }, []) //eslint-disable-line

  useEffect(() => {
    if (templatesOpen && templates.isLoaded === false) {
      dispatch(fetchTemplates())
    }
  }, [templatesOpen]) //eslint-disable-line

  const handleMatterSelection = id => {
    setSelectedMatterId(id)
  }

  useEffect(() => {
    if (props.router.location.pathname.includes('/matter')) {
      let matterId = parseInt(props.router.location.pathname.split('/')[2])
      if (matterId) {
        setSelectedMatterId(matterId)
        setSelectedMatterToTop(true)
      }
    }
  }, [props.router.location.pathname])

  const handleScroll = e => {
    const scrollTop = e.target.scrollTop
    if (scrollTop > 0 && !isScrolling) {
      setIsScrolling(true)
    } else if (scrollTop === 0 && isScrolling) {
      setIsScrolling(false)
    }
  }

  const handleRedirect = () => {
    props.handleClickAway()
  }

  const setFilter = results => {
    setFilteredMatterIds(results)
  }

  const filteredMatters = filteredMatterIds
    ? matters.filter(matter => filteredMatterIds.includes(matter.id))
    : matters

  return (
    <Grow in={true}>
      <div className={classes.container}>
        <MatterSwitcherOpenHeader
          mattersOpen={mattersOpen}
          templatesOpen={templatesOpen}
          onMatterTabChange={() => {
            setMattersOpen(true)
            setTemplatesOpen(false)
            setSelectedMatterId(null)
          }}
          onTemplateTabChange={() => {
            setMattersOpen(false)
            setTemplatesOpen(true)
            setSelectedMatterId(null)
          }}
          closeSwitcher={props.handleClickAway}
          isExternal={isExternal}
        />
        {mattersOpen ? (
          <>
            <div
              className={`${classes.searchContainer} ${
                isScrolling && classes.searchContainerScrollShadow
              }`}
            >
              <MatterSwitcherFilter
                setFilter={setFilter}
                setIsSearching={setIsSearching}
              />
            </div>
            <MatterList
              isLoaded={isLoaded}
              matters={filteredMatters}
              onClick={handleMatterSelection}
              onScroll={handleScroll}
              selectedMatterId={selectedMatterId}
              setSelectedMatterToTop={selectedMatterToTop}
              setIsSearching={isSearching}
            />
          </>
        ) : (
          <TemplatesList
            onScroll={handleScroll}
            templatesList={templates}
            closeSwitcher={props.handleClickAway}
            selectedTemplate={selectedTemplate}
          />
        )}

        {selectedMatterId && (
          <MatterDetails
            handleRedirect={handleRedirect}
            matterId={selectedMatterId}
            handleClose={() => {
              setSelectedMatterId(null)
              props.handleClickAway()
            }}
            matter={filteredMatters.find(m => m.id === selectedMatterId)}
            matterName={
              filteredMatters.find(m => m.id === selectedMatterId)?.name
            }
            handleBack={() => setSelectedMatterId(null)}
          />
        )}
      </div>
    </Grow>
  )
}

export default withRouter(MatterSwitcher)
