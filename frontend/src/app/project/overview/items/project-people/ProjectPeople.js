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

import PropTypes from 'prop-types'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import {
  addAdmin,
  addEditor,
  addViewOnly,
} from '../../../../../redux/ducks/matter-team'
import juralioColours from '../../../../../theme/juralio-colours'
import AddUserFlowContainer from '../../../../matter-details/matter-people/AddUserFlowContainer'
import PeoplePositionsHeader from './PeoplePositionsHeader'
import ProjectPeopleTable from './ProjectPeopleTable'

const useStyles = makeStyles()(theme => ({
  root: {},
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    marginTop: theme.spacing(),
    marginLeft: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  addWrapper: {
    marginLeft: 'auto',
    marginTop: theme.spacing(),
    marginRight: theme.spacing(2),
  },
}))

const ProjectPeople = props => {
  const { classes } = useStyles()

  const options = {
    sort: false,
    filter: true,
    setRowProps: row => {
      if (row[4]) {
        return {
          style: { background: juralioColours.people.row },
        }
      }
    },
  }

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <PeoplePositionsHeader matterDetails={props.matterDetails} />
        {props.isMatterAdmin &&
          (props.matterDetails.matter.projects.length === 1 ||
            props.isMatterOverview) && (
            <div className={classes.addWrapper}>
              <AddUserFlowContainer
                selectedMatter={props.matterDetails.matter}
                matterTeam={props.matterTeam}
                addEditor={addEditor}
                addAdmin={addAdmin}
                addViewOnly={addViewOnly}
                assignAdminRoleInitialValue={false}
                assignEditorRoleInitialValue={true}
              />
            </div>
          )}
      </div>
      <ProjectPeopleTable
        matterAdmins={props.matterAdmins}
        matterTeam={props.matterTeam}
        teamOnProject={props.teamOnProject}
        options={options}
        currentUser={props.currentUser}
        isMatterOverview={props.isMatterOverview}
        isPrivate={props.isPrivate}
        privateTeamMembers={props.privateTeamMembers}
        matterId={props.matterId}
        placeholders={props.placeholders}
      />
    </div>
  )
}

ProjectPeople.propTypes = {
  /** matterAdmins */
  matterAdmins: PropTypes.array,
  /** matterTeam */
  matterTeam: PropTypes.array,
}

export default ProjectPeople
