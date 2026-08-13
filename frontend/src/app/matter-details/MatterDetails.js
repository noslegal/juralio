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

import { mdiArchive } from '@mdi/js'
import Icon from '@mdi/react'
import PeopleIcon from '@mui/icons-material/People'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { Navigate, useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import { ACTIVITIES, OPERATION_MODE } from '../../app/constants'
import NoContent from '../../components/data-display/no-content/NoContent'
import { getProjectIdFromLocation } from '../../components/navigation/common/location-context-helper'
import {
  LabelsIcon,
  MattersIcon,
  MultipleWorkstreamsIcon,
} from '../../theme/navigation/CommonIcons'
import AdminSummary from './admin-summary/AdminSummary'
import MatterArchiveTableContainer from './archive/MatterArchiveContainer'
import MatterHistoryContainer from './history/MatterHistoryContainer'
import LabelsMatterAdminPanel from './labels/LabelsMatterAdminPanelContainer'
import MatterPeopleContainer from './matter-people/MatterPeopleContainer'
import ProjectsContainer from './projects/ProjectsContainer'
import WorkstreamDetailContainer from './projects/workstream-details/WorkstreamDetailContainer'
import { fetchMatterOverview } from './matter-details-actions'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  paperDiv: {
    margin: theme.spacing(2.5),
    height: '100%',
  },
  paperClass: {
    padding: theme.spacing(3),
  },
}))

const MatterDetails = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const { matter } = props
  const [selectedWorkstreamIndex, setSelectedWorkstreamIndex] = useState(null)
  const location = useLocation()
  const userAuthData = useSelector(state => state.auth.data.auth)
  const dispatch = useDispatch()

  const team = useSelector(state => state.matterTeam.mainPage.team)
  const [item, setItem] = useState(
    props.router?.location?.state?.tabItem
      ? props?.router?.location?.state.tabItem
      : 0
  )
  const history = useNavigate()
  // link to a specific workstream. Pass in the workstream id, then find it's index inside the component
  useEffect(() => {
    if (getProjectIdFromLocation(window.location))
      setSelectedWorkstreamIndex(props.router.location?.state?.workstreamId)
  }, [window.location]) //eslint-disable-line

  useEffect(() => {
    if (props.router?.location?.state?.tabItem >= 0) {
      setItem(props.router?.location?.state?.tabItem)
    }
  }, [props.router?.location?.state?.tabItem])

  useEffect(() => {
    if (matter?.id) {
      dispatch(fetchMatterOverview(matter?.id))
    }
  }, [matter]) //eslint-disable-line

  if (!matter) return null

  const listItems = {
    overview: {
      number: 0,
      dataTest: 'overview',
      prompt: t('matterAdmin.prompt'),
      header: t('matterAdmin.overview.header'),
      subtitle: t('matterAdmin.overview.subtitle'),
      matter: matter,
      icon: <MattersIcon />,
      component: (
        <React.Fragment>
          <AdminSummary
            fetch={props.actions.fetchMatterDetails}
            update={props.actions.updateMatterDetails}
            matter={matter}
            readOnly={props.mode === OPERATION_MODE.VIEW}
            item={item}
          />
        </React.Fragment>
      ),
    },
    matterPeople: {
      number: 1,
      dataTest: 'matter-people',
      prompt: t('matterAdmin.prompt'),
      header: t('matterAdmin.people.header'),
      subtitle: t('matterAdmin.people.subtitle'),
      icon: <PeopleIcon />,
      component: (
        <MatterPeopleContainer
          data-test="matter-people-panel"
          matterId={matter.id}
        />
      ),
    },
    projects: {
      number: 2,
      dataTest: 'projects',
      prompt: t('matterAdmin.prompt'),
      header: t('matterAdmin.workstreams.header'),
      subtitle: t('matterAdmin.workstreams.subtitle'),
      icon: <MultipleWorkstreamsIcon />,

      component:
        selectedWorkstreamIndex === null ? (
          <ProjectsContainer
            setSelectedWorkstreamIndex={setSelectedWorkstreamIndex}
            mode={props.mode}
            matterId={props.matter.id}
            matter={matter}
          />
        ) : (
          <WorkstreamDetailContainer
            setSelectedWorkstreamIndex={setSelectedWorkstreamIndex}
            workstreamIndex={selectedWorkstreamIndex}
          />
        ),
    },
    archive: {
      number: 3,
      dataTest: 'archive',
      prompt: t('matterAdmin.prompt'),
      header: t('matterAdmin.archive.header'),
      subtitle: t('matterAdmin.archive.subtitle'),
      icon: <Icon path={mdiArchive} size={1} />,
      component: (
        <MatterArchiveTableContainer
          data-test="archive-panel"
          matter={matter}
        />
      ),
    },
    labels: {
      number: 4,
      dataTest: 'labels',
      prompt: t('matterAdmin.prompt'),
      header: t('matterAdmin.labels.header'),
      subtitle: t('matterAdmin.labels.subtitle'),
      icon: <LabelsIcon />,
      component: <LabelsMatterAdminPanel matter={matter} />,
    },
    history: {
      number: 5,
      dataTest: 'history',
      prompt: t('matterAdmin.prompt'),
      header: t('matterHistory.header'),
      subtitle: t('matterHistory.subheader'),
      icon: <MattersIcon />,
      component: <MatterHistoryContainer matter={matter} />,
    },
  }

  const firstItem = listItems[Object.keys(listItems)[0]]

  const isEditor =
    team
      .filter(t => t.teamMemberId)
      .map(x => x.user)
      .filter(user => user.username === userAuthData.username).length !== 0

  const isMatterViewer =
    team
      .filter(t => t.matterViewerId)
      .map(x => x.user)
      .filter(user => user.username === userAuthData.username).length !== 0

  const seeOverviewbutton =
    firstItem.matter?.projects.filter(
      p => p.active && (p.isPrivateMember || !p.isPrivate)
    ).length > 0

  const isMatterAdminLocation = location.pathname.includes('matteradmin')

  const showMatterOverviewLink =
    (isEditor || isMatterViewer) &&
    isMatterAdminLocation &&
    seeOverviewbutton &&
    firstItem.matter.matterStatus !== 'closed' &&
    firstItem.matter.activeWorkstreams > 0

  return (
    <div className={classes.root} data-test="matterDetails">
      {matter &&
        (props.isForbidden ||
        (matter.activities &&
          !matter.activities.includes(ACTIVITIES.MATTER_ADMIN)) ? (
          <Navigate push to="/404" />
        ) : (
          <>
            <div className={classes.paperDiv}>
              <div
                data-test={`${
                  Object.entries(listItems)[item][1].dataTest
                }-content`}
                className={classes.paperClass}
              >
                {Object.entries(listItems)[item][1].component}
              </div>
            </div>
          </>
        ))}
      {!matter && <NoContent>{t('matterDetails.noContent')}</NoContent>}
    </div>
  )
}

export default MatterDetails
