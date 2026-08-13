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
  Button,
  FormControlLabel,
  Grow,
  Switch,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { fetchMatters } from '../../../../app/matter-list/matter-list-actions'
import withRouter from '../../../../services/navigation/WithRouter'
import juralioColours from '../../../../theme/juralio-colours'
import rawColours from '../../../../theme/raw-colours'
import MatterSwitcherFilter from './filter/MatterSwitcherFilter'
import MatterDetails from './MatterDetails'
import MatterList from './MattersList'
import { triggerCreateNewMatterFlow } from '../../common/dialog-triggers/dialog-trigger-actions'
import { USER_ROLES } from '../../../../app/constants'

const CLOSED = 'closed'

const style = makeStyles()((theme, { height, hasClosedMatters }) => ({
  container: {
    position: 'absolute',
    left: 80,
  },
  mask: {
    position: 'fixed',
    width: '100%',
    height: '100%',
    backgroundColor: juralioColours.darkText.secondary,
    left: 0,
    top: 0,
    zIndex: 100,
  },
  switcherBody: {
    width: theme.spacing(60),
    backgroundColor: rawColours.primary.matterCreateBlue.primary,
    borderRadius: `0px ${theme.spacing(0.5)} ${theme.spacing(
      0.5
    )} ${theme.spacing(0.5)}`,
    overflowY: 'auto',
    height: height,
  },
  switcherBodyInner: {
    height: '98%',
  },
  searchContainer: {
    height: hasClosedMatters ? '96px' : theme.spacing(10),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: rawColours.primary.matterCreateBlue.primary,
    overflow: 'hidden',
  },
  searchContainerScrollShadow: {
    boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.15)',
  },
  selectedSwitcherBody: {
    borderRadius: '0px 0px 0px 4px',
  },
  closedSwitchLabel: {
    color: rawColours.text.white,
    fontSize: theme.spacing(1.5),
    marginLeft: theme.spacing(-0.5),
    marginBottom: '8px',
  },
  closedSwitch: {
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: 40,
    height: 20,
    padding: 0,
    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: 2,
      transitionDuration: '300ms',
      '&.Mui-checked': {
        transform: 'translateX(20px)',
        color: '#FFF', //clicked icon colour
        '& .MuiSwitch-thumb:before': {
          color: rawColours.primary.headerColours.blue,
        },
        '& + .MuiSwitch-track': {
          backgroundColor: rawColours.primary.headerColours.blue, //clicked background colour
          opacity: 1,
          border: 0,
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: 0.5,
        },
      },
      '&.Mui-focusVisible .MuiSwitch-thumb': {
        color: rawColours.primary.headerColours.blue,
        border: '6px solid ',
      },
    },
    '& .MuiSwitch-thumb': {
      boxSizing: 'border-box',
      width: 16,
      height: 16,
    },
    '& .MuiSwitch-track': {
      borderRadius: 20 / 2,
      backgroundColor: 'grey', //unclicked bg colour
      opacity: 1,
      transition: theme.transitions.create(['background-color'], {
        duration: 500,
      }),
    },
  },
  switcherTitle: {
    color: rawColours.primary.white.primary,
    marginRight: 'auto',
    marginLeft: theme.spacing(2.5),
    marginTop: theme.spacing(2),
    width: 'fit-content',
  },
  createMatterButtonWrapper: {
    position: 'absolute',
    bottom: 8,
    display: 'block',
    width: 'fit-content',
    marginLeft: 8,
    marginRight: 'auto',
    zIndex: 100,
  },
  createMatterButton: {
    textTransform: 'none',
    background: 'white',
  },
}))

const MatterSwitcher = props => {
  const dispatch = useDispatch()
  const [isScrolling, setIsScrolling] = useState(false)
  const [selectedMatterId, setSelectedMatterId] = useState(null)
  const [selectedMatterToTop, setSelectedMatterToTop] = useState(false)
  const isLoaded = useSelector(state => state.matters.isLoaded)
  const isLazyLoading = useSelector(state => state.matters.isLazyLoading)
  const matters = useSelector(state => state.matters.matters)
  const userRoles = useSelector(state => state.auth.data.auth.roles)
  const closedMatterCount = matters.filter(
    m => m.matterStatus === CLOSED
  ).length
  const [filteredMatterIds, setFilteredMatterIds] = useState(null)
  const isOnHomePage = props.router.location.pathname.includes('/home')
  const { t } = useTranslation()
  const [isSearching, setIsSearching] = useState(false)
  const [forceClose, setForceClose] = useState(false)

  const getHeightOffset = () => {
    let button = document
      .getElementById('matter-switcher-button')
      ?.getBoundingClientRect()
    if (!button) {
      return 53
    }
    return Math.floor(button.top + button.height)
  }
  const [height, setHeight] = useState(window.innerHeight)
  const { classes } = style({ height, hasClosedMatters: closedMatterCount > 0 })

  const sessionShowClosed =
    window.sessionStorage.getItem('showClosedMatters') === 'true'
  const [showClosed, setShowClosed] = useState(
    sessionShowClosed != null ? sessionShowClosed : false
  )

  const toggleShowClosedMatters = () => {
    setShowClosed(!showClosed)
    window.sessionStorage.setItem('showClosedMatters', !showClosed)
  }

  useEffect(() => {
    if (!isOnHomePage) {
      //this isnt  needed as the homepage also fetches the matters
      dispatch(fetchMatters())
    }
    document.addEventListener(
      'keydown',
      e => {
        if (e.keyCode === 27) {
          props.handleClickAway()
        }
      },
      false
    )
    window.addEventListener('resize', handleResize)

    return () => {
      document.removeEventListener(
        'keydown',
        e => {
          if (e.keyCode === 27) {
            props.handleClickAway()
          }
        },
        false
      )
      window.removeEventListener('resize', handleResize)
    }
  }, []) //eslint-disable-line

  const handleResize = () => {
    setHeight(window.innerHeight)
  }

  const handleMatterSelection = id => {
    setSelectedMatterId(id)
    setForceClose(true)
    setTimeout(() => {
      setForceClose(false)
    }, 100)
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

  let filteredMatters = filteredMatterIds
    ? matters.filter(matter => filteredMatterIds.includes(matter.id))
    : matters
  if (!showClosed) {
    filteredMatters = filteredMatters.filter(m => m.matterStatus !== CLOSED)
  }
  if (
    selectedMatterId &&
    filteredMatterIds &&
    !filteredMatterIds.includes(selectedMatterId)
  ) {
    setSelectedMatterId(null)
    setForceClose(false)
  }

  return (
    <div
      className={classes.mask}
      data-test="matter-switcher-mask"
      onClick={props.handleClickAway}
    >
      <Grow in={true}>
        <div className={classes.container}>
          <div
            className={`${classes.switcherBody} ${
              selectedMatterId && classes.selectedSwitcherBody
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div
              className={classes.switcherBodyInner}
              onClick={() => setForceClose(true)}
            >
              <Typography variant="h6" className={classes.switcherTitle}>
                {t('matterSwitcher.title')}
              </Typography>
              <div
                className={`${classes.searchContainer} ${
                  isScrolling && classes.searchContainerScrollShadow
                }`}
              >
                {closedMatterCount > 0 && (
                  <FormControlLabel
                    label={
                      <Typography className={classes.closedSwitchLabel}>
                        {t('matterSwitcher.showClosed')}
                      </Typography>
                    }
                    control={
                      <Switch
                        onChange={toggleShowClosedMatters}
                        data-test={'closed-matters-checkbox'}
                        className={classes.closedSwitch}
                        checked={showClosed}
                      />
                    }
                  />
                )}
                <MatterSwitcherFilter
                  setFilter={setFilter}
                  setIsSearching={setIsSearching}
                  matters={matters}
                />
              </div>
              <MatterList
                showClosed={showClosed}
                isLoaded={isLoaded}
                matters={filteredMatters}
                onClick={handleMatterSelection}
                onScroll={handleScroll}
                selectedMatterId={selectedMatterId}
                handleClose={props.handleClickAway}
                setSelectedMatterToTop={selectedMatterToTop}
                searchInProgress={isSearching}
                isLazyLoading={isLazyLoading}
                switcherContext={true}
              />
              {userRoles.includes(USER_ROLES.ROLE_MATTER_CREATOR) && (
                <div className={classes.createMatterButtonWrapper}>
                  <Button
                    data-test={'create-new-item-card'}
                    className={classes.createMatterButton}
                    onClick={() => {
                      dispatch(triggerCreateNewMatterFlow())
                      props.handleClickAway()
                    }}
                  >
                    {t('matterCreation.createNewMatter')}
                  </Button>
                </div>
              )}
            </div>

            {selectedMatterId && (
              <MatterDetails
                handleRedirect={handleRedirect}
                matterId={selectedMatterId}
                handleClose={props.handleClickAway}
                matter={matters.filter(m => m.id === selectedMatterId)[0]}
                forceClose={forceClose}
                forceHeight={height}
              />
            )}
          </div>
        </div>
      </Grow>
    </div>
  )
}

export default withRouter(MatterSwitcher)
