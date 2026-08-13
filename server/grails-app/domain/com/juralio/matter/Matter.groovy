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

package com.juralio.matter


import com.juralio.auth.AppUser
import com.juralio.label.InactiveLabel
import com.juralio.label.Label
import com.juralio.matter.costs.MatterCosts
import com.juralio.organisation.Organisation
import com.juralio.organisationgroup.GroupPosition
import com.juralio.organisationgroup.MatterGroupPosition
import com.juralio.organisationgroup.MatterGroupPositionDTO
import com.juralio.project.Project
import grails.plugins.orm.auditable.Auditable

class Matter implements Auditable {

    public static final NAME = "name"
    public static final CLIENT_NAME = "clientName"
    public static final ACTIVITIES = "activities"

    String name
    String clientName
    String department
    String caseId
    String userDefinedReferenceNumber
    Date creationDate = new Date()
    String matterStatus = MatterStatus.INACTIVE.value()
    AppUser creator
    Matter deletedMirror
    Organisation organisation
    Boolean isNeutralMatter = false
    List<String> activities
    String description
    Boolean isPersonal = false
    List<GroupPosition> groupPositions
    List<MatterGroupPositionDTO> positionsOfGroups


    static hasMany = [matterAdmins: MatterAdmin, teamMembers: MatterTeamMember, matterViewers: MatterViewer, matterCosts: MatterCosts, projects: Project, inactiveLabels: InactiveLabel, labels: Label]
    static transients = ['activities', 'groupPositions','positionsOfGroups']
    static constraints = {
        name nullable: false, blank: false
        caseId nullable: true, blank: true
        creator nullable: true, bindable: false
        deletedMirror nullable: true, bindable: false
        organisation nullable: false, blank: false, bindable: false
        isNeutralMatter nullable: false, blank: false
        userDefinedReferenceNumber nullable: true, bindable: true, blank: true
        description nullable: true, size: 0..500
        isPersonal nullable: false, blank: false
        department nullable: true, size: 0..60
    }
}
