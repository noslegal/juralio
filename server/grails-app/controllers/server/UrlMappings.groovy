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

package server

import com.juralio.common.RequestParameterValidationFailedException
import com.juralio.post.exception.DuplicateTeamMemberException
import com.juralio.post.exception.NoValidUserException
import com.juralio.task.exception.MaximumTasksExceededException
import org.springframework.orm.hibernate5.HibernateOptimisticLockingFailureException
import org.springframework.security.access.AccessDeniedException

class UrlMappings {

    static mappings = {
        /***************
         Organisation
         ****************/
        "/api/organisations/"(controller: 'organisation') {
            action = [GET: 'index', POST: 'save']
        }
        "/api/organisations/$id"(controller: "organisation") {
            action = [GET: 'show', PATCH: 'update', DELETE: 'delete']
        }
        "/api/organisations/$id/restore"(controller: "organisation") {
            action = [POST: 'restore']
        }

        "/api/organisations/$id/reports/$specificMonth"(controller: "organisationUserConfirmationSummary") {
            action = [GET: 'getSpecificReport']
        }
        "/api/organisations/$id/reports"(controller: "organisationUserConfirmationSummary") {
            action = [GET: 'getSummaryDataForOrg']
        }
//        "/api/organisations/$id/reports/generate"(controller: "organisationUserConfirmationSummary") {
//            action = [GET: 'forceGenerateReports']
//        }
        "/api/organisation"(controller: "organisation") {
            action = [GET: "showCurrentUserOrganisation"]
        }
        "/api/organisations/$id/users"(controller: "organisationUser") {
            action = [GET: 'index', POST: 'save', DELETE: 'delete']
        }
        "/api/organisations/$organisationId/logo"(controller: "organisationLogo") {
            action = [GET: "getLogo", POST: "setLogo", DELETE: "deleteLogo"]
        }
        "/api/organisations/$orgId/user/$userId/confirm"(controller: "organisationUserConfirmation") {
            action = [GET: "index", POST: "setConfirmedStatus"]
        }
        "/api/organisations/$orgId/trialmessage"(controller: "organisationTrialMessage") {
            action = [GET: "index", POST: "save", PATCH: 'update']
        }
        "/api/organisations/$orgId/lapsedloginmessage"(controller: "organisationLapsedLoginMessage") {
            action = [GET: 'index', POST: "save", PATCH: 'update']
        }

        "/api/groups"(controller: "organisationGroup"){
            action = [GET: 'list']
        }
        "/api/groupPositions"(controller: "GroupPosition"){
            action = [GET: 'show']
        }
        "/api/matter/$matter_id/matterGroupPosition"(controller: "matterGroupPosition"){
            action = [GET: 'list', PATCH: 'update']
        }
        "/api/matter/$matter_id/matterGroupPosition/$groupId"(controller: "matterGroupPosition"){
            action = [DELETE:'delete']
        }

        "/api/organisations/$org_id/group"(controller: "organisationGroup") {
            action = [GET: 'show', POST: "save"]
        }

        "/api/organisations/$org_id/groups"(controller: "organisationGroup") {
            action = [GET: 'orgList']
        }

        "/api/organisations/$org_id/group/$group_id"(controller: "organisationGroup") {
            action = [GET: 'index', PATCH: "update", DELETE: "delete"]
        }

        "/api/organisations/$org_id/group/$group_id/logo"(controller: "groupLogo") {
            action = [GET: "getLogo", POST: "setLogo", DELETE: "deleteLogo"]
        }


        /***************
         Costs
         ****************/
        "/api/grades"(controller: 'grade') {
            action = [POST: "show"]
        }

        "/api/grade"(controller: 'grade') {
            action = [POST: "save"]
        }

        "/api/matter/$matter_id/grades"(controller: 'grade') {
            action = [GET: "getGradesFromRTD"]
        }

        "/api/grade/$id"(controller: 'grade') {
            action = [GET: "index", PATCH: "update", DELETE: "delete"]
        }

        "/api/grade/$orgId/generateDefaults"(controller: 'grade') {
            action = [POST: "generateDefaults"]
        }

        "/api/gradecategory"(controller: 'gradeCategory') {
            action = [POST: "show"]
        }

        "/api/gradecategories"(controller: 'gradeCategory') {
            action = [ POST: "save"]
        }

        "/api/gradecategory/$id"(controller: 'gradeCategory') {
            action = [GET: "index", PATCH: "update", DELETE: "delete"]
        }


        "/api/rate_table_details"(controller: 'rateTableDetails') {
            action = [POST: "show",]
        }

        "/api/rate_table_detail"(controller: 'rateTableDetails') {
            action = [POST: "save"]
        }

        "/api/rate_table_details/filter"(controller: 'rateTableDetails') {
            action = [POST: "filteredOrgRateTableDetails"]
        }

        "/api/rate_table_details/$id"(controller: 'rateTableDetails') {
            action = [GET: "index", PATCH: "update", DELETE: "delete"]
        }

        "/api/rate_table_details/matter/$matterId"(controller: 'rateTableDetails') {
            action = [GET: "getMatterRTD", DELETE: "deleteMatterRTD"]
        }

        "/api/periods"(controller: 'period') {
            action = [GET: "show", POST: "save"]
        }

        "/api/period/$id"(controller: 'period') {
            action = [GET: "index", PATCH: "update", POST: "delete"]
        }

        "/api/period/$id/delete"(controller: 'period') {
            action = [POST: "delete"]
        }

        "/api/period/$id/update"(controller: 'period') {
            action = [PATCH: "update"]
        }
        "/api/rate_type"(controller: 'rateType') {
            action = [POST: "show"]
        }
        "/api/rate_types"(controller: 'rateType') {
            action = [POST: "save"]
        }

        "/api/rate_type/$id"(controller: 'rateType') {
            action = [GET: "index", PATCH: "update", DELETE: "delete"]
        }
        "/api/rate_type/$orgId/generateDefaults"(controller: 'rateType') {
            action = [POST: "generateDefaults"]
        }

        "/api/rates"(controller: 'rate') {
            action = [GET: "show", POST: "save"]
        }

        "/api/rates/bulk"(controller: 'rate') {
            action = [POST: "bulkSave",PATCH: "bulkUpdate"]
        }

        "/api/rates/$table_details_id"(controller: 'rate') {
            action = [GET: "getTable"]
        }

        "/api/rates/$table_details_id/matter/$matter_id/$setup"(controller: 'rate') {
            action = [GET: "getMatterTable"]
        }

        "/api/rate/$id"(controller: 'rate') {
            action = [GET: "index", PATCH: "update"]
        }

        "/api/otherCost"(controller: 'otherCost') {
            action = [POST: "show"]
        }

        "/api/otherCosts"(controller: 'otherCost') {
            action = [ POST: "save"]
        }

        "/api/otherCost/$id"(controller: 'otherCost') {
            action = [GET: "index", PATCH: "update", DELETE: "delete"]
        }

        "/api/otherCosts/$orgId/generateDefaults"(controller: 'otherCost') {
            action = [POST: "generateDefaults"]
        }

        "/api/costs/stageData"(controller: 'costs') {
            action = [POST: "getStageData"]
        }
        "/api/costs/matterStageData/$matterId"(controller: 'costs') {
            action = [GET: "getMatterStageData"]
        }
        "/api/costs/clientMatterStageData/$matterId"(controller: 'costs') {
            action = [GET: "getClientMatterStageData"]
        }
        "/api/costs/resourceStageData/$projectionPeriodId"(controller: 'costs') {
            action = [GET: "getProjectionStageData"]
        }

        "/api/costs/pricing/$matterId"(controller: 'matterPricing') {
            action = [POST: "save", GET: 'index']
        }
        "/api/costs/pricing/$matterId/$pricingId"(controller: 'matterPricing') {
            action = [PATCH: "update", DELETE: "delete"]
        }
        "/api/costs/outOfScopeDetails/$matterId"(controller: 'outOfScopeDetails') {
            action = [POST: "save"]
        }
        "/api/costs/outOfScopeDetails/$matterId/$id"(controller: 'outOfScopeDetails') {
            action = [PATCH: "update", DELETE: "delete"]
        }
        "/api/costs/costRatio/$matterId"(controller: 'costRatio') {
            action = [POST: "save", GET: 'show']
        }
        "/api/costs/costRatio/$matterId/$id"(controller: 'costRatio') {
            action = [PATCH: "update"]
        }
        "/api/costs/costRatio/$matterId/batch"(controller: 'costRatio') {
            action = [PATCH: "batchUpdate"]
        }
        "/api/costs/costRatio/$matterId/reset"(controller: 'costRatio') {
            action = [POST: "reset"]
        }
        "/api/costs/costTimeEstimate/$matterId"(controller: 'costTimeEstimate') {
            action = [POST: "save", GET: 'show']
        }
        "/api/costs/costTimeEstimate/$matterId/sync"(controller: 'costTimeEstimate') {
            action = [POST: "syncFromTasks"]
        }
        "/api/costs/costTimeEstimate/$task_id/$id"(controller: 'costTimeEstimate') {
            action = [PATCH: "update"]
        }
        "/api/costs/costTimeEstimate/$period_id/bulk"(controller: 'costTimeEstimate') {
            action = [PATCH: "bulkUpdate"]
        }
        "/api/costs/snapshot/$matter_id"(controller: 'snapshot') {
            action = [GET: "index", POST: "save"]
        }
        "/api/costs/snapshot/$matter_id/$snapshot_id"(controller: 'snapshot') {
            action = [PATCH: "update"]
        }
        "/api/costs/assumption/$matter_id"(controller: 'assumption'){
            action = [GET: "show", POST: "save"]
        }
        "/api/costs/assumption/$matter_id/bulk"(controller: 'assumption'){
            action = [POST: "bulkSave", PATCH: "bulkUpdate"]
        }
        "/api/costs/assumption/$matter_id/$assumption_id"(controller: 'assumption'){
            action = [GET: "index", PATCH: "update", DELETE: 'delete']
        }
        "/api/costs/projectionPeriod/$matter_id"(controller: 'projectionPeriod') {
            action = [POST: "save"]
        }
        "/api/costs/projectionPeriod/$matter_id/$projectionPeriodId"(controller: 'projectionPeriod') {
            action = [PATCH: "update"]
        }
        /***************
         Matters
         ****************/
        "/api/matters"(controller: 'matter') {
            action = [GET: "index", POST: "save"]
        }
        "/api/matter/$id"(controller: 'matter') {
            action = [GET: "show"]
        }
        "/api/matter/$id/overview"(controller: 'matterOverview') {
            action = [GET: "show"]
        }
        "/api/matters/shared"(controller: 'MatterShared') {
            action = [POST: "getSharedMatters"]
        }
        "/api/matters/deleted"(controller: 'deletedMatterLog') {
            action = [GET: "index"]
        }
        "/api/matters/search/teammembers"(controller: 'MatterTeamMemberSearch') {
            action = [POST: "getTeamMembers"]
        }
        "/api/matter/$matter_id/team"(controller: 'matterTeam') {
            action = [GET: "getTeam"]
        }
        "/api/admin/matter/$matter_id"(controller: 'matter') {
            action = [PATCH: "patch"]
        }
        "/api/admin/matter/$matter_id/notify"(controller: 'matterAdmin') {
            action = [POST: "notifyTeamMember"]
        }
        "/api/admin/matter/$matter_id/history"(controller: 'matterHistory') {
            action = [GET: "index"]
        }
        "/api/admin/matter/$matter_id/history/filters"(controller: 'matterHistory') {
            action = [GET: "filters"]
        }
        "/api/admin/matter/$matter_id/history/export"(controller: 'matterHistory') {
            action = [GET: "export"]
        }
        "/api/admin/matter/$matter_id/matters"(controller: 'matterAdmin') {
            action = [POST: "save"]
        }
        "/api/admin/matter/$matter_id/removeUser"(controller: 'matterAdmin') {
            action = [DELETE: "removeUser"]
        }
        "/api/admin/matter/$matter_id/matters/$id?"(controller: 'matterAdmin') {
            action = [DELETE: "delete"]
        }
        "/api/admin/matter/$matter_id/teammembers"(controller: 'matterTeamMember') {
            action = [POST: "save"]
        }
        "/api/admin/matter/$matter_id/teammembers/$id?"(controller: 'matterTeamMember') {
            action = [DELETE: "delete"]
        }
        "/api/admin/matter/$matter_id/viewers"(controller: 'matterViewer') {
            action = [POST: "save"]
        }
        "/api/admin/matter/$matter_id/viewers/$id?"(controller: 'matterViewer') {
            action = [DELETE: "delete"]
        }
        "/api/admin/matter/$matter_id/placeholders/$id"(controller: 'placeholders') {
            action = [GET: "index", PATCH: "patch", DELETE: 'disable']
        }
        "/api/admin/matter/$matter_id/placeholders/$id/tasks"(controller: 'placeholders') {
            action = [GET: "getTasks"]
        }
        "/api/admin/matter/$matter_id/placeholders"(controller: 'placeholders') {
            action = [GET: "show", POST: "save"]
        }
        "/api/admin/matter/$matter_id/placeholders/merge"(controller: 'placeholders') {
            action = [POST: "merge"]
        }
        "/api/admin/matter/$matter_id/costs"(controller: 'matterCosts') {
            action = [POST: "save"]
        }
        "/api/admin/matter/$matter_id/costs/$id?"(controller: 'matterCosts') {
            action = [DELETE: "delete"]
        }


        // /***************
        //  Matter Party
        //  ****************/
        // "/api/matter/$matter_id/party"(controller: 'matterParty') {
        //     action = [GET: "index", POST: "save"]
        // }
        // "/api/matter/$matter_id/party/$party_id"(controller: 'matterParty') {
        //     action = [GET: "show", DELETE: "delete", PATCH: "update"]
        // }
        // "/api/matter/$matter_id/party/teammembers"(controller: 'matterPartyMember') {
        //     action = [GET: "index"]
        // }
        // "/api/matter/$matter_id/party/$party_id/teammembers"(controller: 'matterPartyMember') {
        //     action = [POST: "save"]
        // }
        // "/api/matter/$matter_id/party/$party_id/teammembers/$id"(controller: 'matterPartyMember') {
        //     action = [GET: "show", DELETE: "delete"]
        // }

        /***************
         Workstreams (formerly Projects).
         ****************/
        "/api/workstreams"(controller: 'TutorialProject') {
            action = [POST: "save"]
        }
        "/api/matter/$id/workstreams"(controller: 'project') {
            action = [POST: "save", GET: 'listForMatter']
        }
        "/api/admin/matter/$matter_id/workstreams/$project_id"(controller: 'projectAdmin') {
            action = [PATCH: "update"]
        }
        "/api/matter/$matter_id/workstreams/$id"(controller: 'project') {
            action = [GET: "show"]
        }
        "/api/matter/$matter_id/workstreams/$id/preview"(controller: 'project') {
            action = [GET: "preview"]
        }
        "/api/matter/$matter_id/workstreams/$id/overview"(controller: 'project') {
            action = [GET: "getOverview"]
        }
        "/api/matter/$matter_id/workstreams/$id/structure"(controller: 'project') {
            action = [GET: "getStructure"]
        }
        "/api/matter/$matter_id/workstreams/$id/visit"(controller: 'projectVisitRecency') {
            action = [POST: "save"]
        }

        "/api/matter/$matter_id/workstreams/$id/link"(controller: 'taskLink') {
            action = [POST: "saveList"]
        }
        "/api/matter/$matter_id/workstreams/$id/tasks/new"(controller: 'projectVisitRecency') {
            action = [GET: "show"]
        }
        "/api/matter/$matter_id/workstreams/$project_id/tasks/$task_id/seen"(controller: 'projectVisitRecency') {
            action = [PATCH: "updateTask"]
        }

        "/api/matter/$matter_id/workstreams/$project_id/resources"(controller: 'linkResource') {
            action = [POST: "save", GET: "index"]
        }
        "/api/matter/$matter_id/workstreams/resources"(controller: 'linkResource') {
            action = [GET: "getMatterWorkstreamResources"]
        }

        "/api/matter/$matter_id/workstreams/$project_id/resources/$id"(controller: 'linkResource') {
            action = [POST: "visit", PATCH: "patch", DELETE: "delete"]
        }
        "/api/matter/$matter_id/resources"(controller: 'linkResource') {
            action = [POST: "save", GET: "index"]
        }
        "/api/matter/$matter_id/resources/$id"(controller: 'linkResource') {
            action = [POST: "visit", PATCH: "patch", DELETE: "delete"]
        }

        "/api/matter/$matter_id/workstreams/$project_id/teammembers"(controller: 'privateWorkstreamMember') {
            action = [GET: "getAll", POST: "save"]
        }
        "/api/matter/$matter_id/workstreams/$project_id/teammembers/$id?"(controller: 'privateWorkstreamMember') {
            action = [DELETE: "delete"]
        }

        /***************
         Tasks
         ****************/
        "/api/matter/$matter_id/workstreams/$project_id/tasks"(controller: 'task') {
            action = [POST: "save", GET: 'index', PATCH: "updateList", DELETE: 'delete']
        }

        "/api/matter/$matter_id/tasks/archived"(controller: 'taskArchive') {
            action = [GET: 'index']
        }

        "/api/matter/$matter_id/tasks"(controller: 'task') {
            action = [GET: 'getAllMatterTasks']
        }

        "/api/matter/$matter_id/workstreams/$project_id/task/$id"(controller: 'task') {
            action = [GET: "show", PATCH: 'update']
        }
        "/api/matter/$matter_id/workstreams/$project_id/task/$id/shift"(controller: 'taskShift') {
            action = [PATCH: 'shift']
        }
        "/api/matter/$matter_id/workstreams/$project_id/bulkShift"(controller: 'taskShift') {
            action = [PATCH: 'bulkShift']
        }

        "/api/matter/$matter_id/workstreams/$project_id/task/$task_id/block/$task2_id"(controller: "taskBlocker") {
            action = [DELETE: 'removeTaskBlocker']
        }

        "/api/matter/$matter_id/workstreams/$project_id/task/$task_id/blocks"(controller: "taskBlocker") {
            action = [GET: 'getValidBlocks']
        }

        "/api/matter/$matter_id/workstreams/$project_id/task/$task_id/block"(controller: "taskBlocker") {
            action = [GET: 'getAllBlockers', POST: "addTaskBlocker"]
        }

        "/api/matter/$matter_id/workstreams/$project_id/task/$id/siblings"(controller: 'task') {
            action = [GET: 'showSiblings']
        }
        "/api/matter/$matter_id/workstreams/$project_id/task/$id/children"(controller: 'task') {
            action = [GET: 'showChildren']
        }
        "/api/matter/$matter_id/workstreams/$project_id/task/$id/link"(controller: 'taskLink') {
            action = [POST: 'save']
        }
        "/api/matter/$matter_id/workstreams/$workstream_id/tasks/$id/getMinMaxBoundsUpTree"(controller: 'task') {
            action = [GET: 'getMinMaxBoundsUpTree']
        }
        // "/api/matter/$matter_id/workstreams/$project_id/task/$id/linkAllSiblings"(controller: 'taskLink') {
        //     action = [POST: 'saveAll']
        // }
        "/api/matter/$matter_id/workstreams/$project_id/task/$taskId/followers"(controller: 'taskFollower') {
            action = [POST: 'save']
        }
        "/api/matter/$matter_id/workstreams/$project_id/task/$taskId/followers/$userId"(controller: 'deleteTaskFollower') {
            action = [DELETE: 'delete']
        }
        "/api/matter/$matter_id/workstreams/$project_id/task/$taskId/teammembers"(controller: 'taskTeamMember') {
            action = [POST: 'save']
        }
        "/api/matter/$matter_id/workstreams/$project_id/task/$taskId/teammembers/$userId/tree"(controller: 'deleteTaskTeamMember') {
            action = [DELETE: 'deleteTree']
        }
        "/api/matter/$matter_id/workstreams/$project_id/task/$taskId/teammembers/$userId"(controller: 'deleteTaskTeamMember') {
            action = [DELETE: 'delete']
        }
        "/api/matter/$matter_id/workstreams/$project_id/task/$id/copy"(controller: 'taskCopy') {
            action = [POST: "copy"]
        }
        "/api/matter/$matter_id/workstreams/$project_id/task/$id/move"(controller: 'taskMove') {
            action = [POST: "move"]
        }
        "/api/matter/$matter_id/workstreams/$project_id/task/$id/archive"(controller: 'taskArchive', action: 'archive') {
            action = [POST: "archive"]
        }
        "/api/matter/$matter_id/workstreams/$project_id/task/$id/unarchive"(controller: 'taskArchive') {
            action = [POST: "unarchive"]
        }
        "/api/matter/$matter_id/workstreams/$project_id/task/$task_id/checkConsistency"(controller: 'taskConsistency') {
            action = [POST: "check"]
        }
        "/api/matter/$matter_id/workstreams/$project_id/task/$task_id/checkDateConsistency"(controller: 'taskConsistency') {
            action = [POST: 'checkDates']
        }

        "/api/matter/$matter_id/workstreams/$project_id/task/$task_id/problemDates"(controller: 'taskConsistency') {
            action = [POST: 'getProblemDates']
        }

        "/api/tasks/recent"(controller: 'taskRecency') {
            action = [GET: "listRecentTasksForUser"]
        }
        "/api/matter/$matter_id/search/users/$user_id"(controller: "taskFilterUserRecency") {
            action = [POST: 'save']
        }
        "/api/matter/$matter_id/search/users"(controller: "taskFilterUserRecency") {
            action = [GET: 'index']
        }
        "/api/tasksAffected"(controller: 'TaskStatusChange') {
            action = [POST: 'affectedTasks']
        }

        /***************
         Posts
         ****************/
        "/api/matter/$matter_id/workstreams/$project_id/task/$task_id/posts"(controller: 'taskPosts') {
            action = [GET: "index", POST: "save"]
        }
        "/api/matter/$matter_id/workstreams/$project_id/task/$task_id/post/$post_id"(controller: 'taskPosts') {
            action = [GET: "show", PATCH: "update"]
        }
        "/api/matter/$matter_id/workstreams/$project_id/task/$task_id/post/$post_id/authors"(controller: 'postAuthor') {
            action = [POST: "save"]
        }
        "/api/matter/$matterId/workstreams/$projectId/task/$taskId/post/$postId/authors/$userId"(controller: 'deletePostAuthor') {
            action = [DELETE: "delete"]
        }
        "/api/matter/$matter_id/workstreams/$project_id/task/$task_id/post/$post_id/postmembers"(controller: 'postMember') {
            action = [POST: "save"]
        }
        "/api/matter/$matter_id/workstreams/$project_id/task/$task_id/post/$post_id/postmembers/$user_id"(controller: 'deletePostMember') {
            action = [DELETE: "delete"]
        }
        "/api/matter/$matter_id/workstreams/$project_id/task/$task_id/post/$post_id/move"(controller: 'postMove') {
            action = [POST: 'move']
        }
        "/api/matter/$matter_id/posts"(controller: 'postArchive') {
            action = [GET: 'index']
        }
        "/api/matter/$matterId/post/$postId"(controller: 'postArchive') {
            action = [PATCH: 'restore']
        }

        /***************
         Usage
         ****************/
        "/api/usage"(controller: "usage", action: "show") {
            action = [GET: "show"]
        }
        "/api/usage/report/summary"(controller: "usageSummary") {
            action = [GET: "showSummary"]
        }
        "/api/usage/report/month"(controller: "usageSummary") {
            action = [POST: "getMonthDetail"]
        }

        /***************
         User
         ****************/
        "/api/users/search"(controller: "userSearch", action: "search") {
            action = [POST: "search"]
        }
        "/api/users/bulk"(controller: 'user') {
            action = [POST: "bulkSave"]
        }
        "/api/users"(controller: 'user') {
            action = [GET: "index", POST: "save"]
        }
        "/api/user"(controller: 'authenticatedUser') {
            action = [GET: "show", PATCH: 'updateSelf']
        }

        "/api/user/password"(controller: 'authenticatedUser') {
            action = [POST: "userChangeOwnPassword"]
        }
        "/api/users/$id"(controller: 'user') {
            action = [GET: "show", PATCH: "update", DELETE: "delete"]
        }
        "/api/users/$id/activitylog"(controller: 'user') {
            action = [GET: "getActivityLog"]
        }

        "/api/settings/user/password"(controller: 'userPasswordChange') {
            action = [POST: "userChangeOwnPassword"]
        }
        "/api/settings/user/resendInvite"(controller: 'resendInvite') {
            action = [POST: "resendInv"]
        }
        "/api/settings/users/$userId/password"(controller: 'temporaryPassword') {
            action = [GET: "requestTemporaryPassword"]
        }
        "/api/settings/user/updateftue"(controller: 'firstTimeUserExperience') {
            action = [PATCH: "update"]
        }
        "/api/settings/user/$userId/resetftue"(controller: 'firstTimeUserExperienceReset') {
            action = [POST: "reset"]
        }
        "/api/settings/user/$userId/visit"(controller: 'visit') {
            action = [POST: "visit", GET: "getVisit"]
        }
        "/api/settings/user/tours"(controller: 'tour') {
            action = [GET: "index"]
        }
        "/api/settings/user/completeTour"(controller: 'tour') {
            action = [POST: "complete"]
        }
        "/api/settings/user/$userId/resetTours"(controller: 'tour') {
            action = [GET: "reset"]
        }
        "/api/user/$id/todo"(controller: 'userTodos') {
            action = [GET: "show"]
        }


        /****************
         Template
         ****************/
        "/api/projecttemplates/$templateId/export"(controller: "projectTemplateExport") {
            action = [GET: 'export']
        }
        "/api/projecttemplates/import"(controller: "projectTemplateExport") {
            action = [POST: 'importTemplate']
        }
        "/api/projecttemplates/$templateId/export/json"(controller: "projectTemplateUserExport") {
            action = [GET: 'export']
        }
        "/api/projecttemplates/import/json"(controller: "projectTemplateUserExport") {
            action = [POST: 'importTemplate']
        }


        "/api/projecttemplates"(controller: "projectTemplate") {
            action = [GET: 'index', POST: 'save']
        }
        "/api/projecttemplates/$id"(controller: "projectTemplate") {
            action = [GET: 'show', DELETE: "delete"]
        }
        "/api/projecttemplates/$id/structure"(controller: "projectTemplate") {
            action = [GET: 'getStructure']
        }
        "/api/projecttemplates/$id/preview"(controller: "projectTemplate") {
            action = [GET: 'preview']
        }
        "/api/admin/projecttemplates/$templateId"(controller: "ProjectTemplateAdmin") {
            action = [PATCH: 'update']
        }
        "/api/projecttemplates/$template_id/tasks"(controller: "taskTemplate") {
            action = [GET: 'index', POST: "save", PATCH: "updateList"]
        }

        "/api/projecttemplates/$template_id/tasks/search"(controller: "taskTemplateSearch") {
            action = [GET: 'index']
        }
        "/api/projecttemplates/$template_id/tasks/$id"(controller: "taskTemplate") {
            action = [GET: 'show', DELETE: "delete", PATCH: "patch"]
        }
        "/api/projecttemplates/$templateId/tasks/$taskId/copy"(controller: "taskTemplateCopy") {
            action = [POST: "copy"]
        }
        "/api/projecttemplates/$templateId/tasks/$taskId/move"(controller: "taskTemplateMove") {
            action = [POST: "move"]
        }
        "/api/projecttemplates/$templateId/copy"(controller: "ProjectTemplateCopy") {
            action = [POST: "copy"]
        }
        // "/api/projecttemplates/recenttemplates"(controller: 'projectTemplate') {
        //     action = [GET: "listRecentProjectTemplatesForUser"]
        // }
        "/api/projecttemplates/$templateId/favourite"(controller: "projectTemplateFavourite") {
            action = [POST: "save", DELETE: "delete", GET: "show"]
        }
        "/api/projecttemplates/$templateId/systemttemplate"(controller: 'systemTemplate') {
            action = [PATCH: 'updateSystemTemplate', GET: 'getSystemTemplate']
        }

        "/api/projecttemplates/$templateId/resources"(controller: "templateResource") {
            action = [POST: 'addResource', GET: 'listResources']
        }
        "/api/projecttemplates/$templateId/resources/$id"(controller: 'templateResource') {
            action = [PATCH: 'updateResource', GET: 'getResource', DELETE: 'deleteResource']
        }
        "/api/projecttemplates/$templateId/export"(controller: "projectTemplateExport") {
            action = [GET: 'export']
        }
        "/api/projecttemplates/import"(controller: "projectTemplateExport") {
            action = [POST: 'importTemplate']
        }


        /***************
         Template Posts
         ****************/
        "/api/projecttemplates/$templateId/tasks/$templateTaskId/posts"(controller: 'templateTaskPosts') {
            action = [GET: "index", POST: "save"]
        }

        "/api/projecttemplates/$templateId/tasks/$templateTaskId/posts/$templatePostId"(controller: 'templateTaskPosts') {
            action = [GET: "show", PATCH: "update", DELETE: "delete"]
        }

        "/api/projecttemplates/$templateId/tasks/$templateTaskId/posts/$templatePostId/move"(controller: 'templatePostMove') {
            action = [POST: 'move']
        }

        /****************
         * User Notification (MatterEvent-backed)
         ****************/
        "/api/usernotifications"(controller: "userNotification") {
            action = [GET: 'index']
        }
        "/api/usernotifications/count"(controller: "userNotification") {
            action = [GET: 'count']
        }
        "/api/usernotifications/read-all"(controller: "userNotification", action: 'markAllRead')
        "/api/usernotifications/$id/read"(controller: "userNotification", action: 'markRead')
        "/api/usernotifications/$id/dismiss"(controller: "userNotification", action: 'dismiss')

        /****************
         * Notification Filter User Recency
         ****************/
        "/api/notificationfilteruserrecency"(controller: "NotificationFilterUserRecency") {
            action = [GET: 'index']
        }

        /****************
         * Search
         ****************/
        "/api/todo/search"(controller: "projectContentSearch") {
            action = [GET: 'performSearch']
        }
        //old search no longer used
//        "/api/universal/search"(controller: "projectContentSearch") {
//            action = [GET: 'performSearch']
//        }
        "/api/matter/$matter_id/workstreams/$project_id/search"(controller: "projectContentSearch") {
            action = [GET: 'performSearch']
        }
        "/api/universal/fuzzysearch"(controller: "fuzzySearch") {
            action = [GET: 'performSearch']
        }


        /****************
         * Labels
         ****************/
        "/api/labels/system"(controller: 'label') {
            action = [GET: 'getLabelsForSystem']
        }
        "/api/matter/$matterId/labels/merge"(controller: 'label') {
            action = [POST: 'mergeMatterLabels']
        }
        "/api/matter/$matterId/labels"(controller: 'label') {
            action = [GET: "getLabelsForMatter", POST: 'addMatterLabel']
        }
        "/api/matter/$matterId/labels/$labelId"(controller: 'label') {
            action = [GET: 'getUsageForLabel', PATCH: 'updateLabelForMatter', POST: 'deleteMatterLabelUsages']
        }

        "/api/organisation/labels/$labelId"(controller: 'label') {
            action = [PATCH: 'updateLabelForOrganisation']
        }
        "/api/organisation/labels"(controller: 'label') {
            action = [POST: 'addOrganisationLabel', GET: 'getLabelsForOrganisation']
        }

        "/api/matter/$matter_id/workstreams/$project_id/task/$task_id/labels"(controller: 'taskLabel') {
            action = [GET: "getTaskLabels", POST: "addLabelToTask"]
        }

        "/api/matter/$matter_id/workstreams/$project_id/task/$task_id/labels/$label_id"(controller: 'taskLabel') {
            action = [PATCH: "updateTaskLabel", DELETE: "deleteLabelFromTask"]
        }

        // /****************
        //  * Noticeboard
        //  ****************/
        // "/api/noticeboard/notice"(controller: "noticeboard") {
        //     action = [POST: 'addNotice', GET: 'getNotice']
        // }
        // "/api/noticeboard/notice/$notice_id"(controller: "noticeboard") {
        //     action = [GET: 'getNoticeById', DELETE: 'deleteNoticeById']
        // }
        // "/api/noticeboard/notice/$notice_id/meta"(controller: "noticeboard") {
        //     action = [GET: 'getNoticeMeta']
        // }
        // "/api/noticeboard/meta"(controller: "noticeboard") {
        //     action = [GET: 'listNoticeMeta']
        // }
        // "/api/noticeboard/notice/$notice_id/feature"(controller: "noticeboard") {
        //     action = [POST: 'featureNotice']
        // }

        // /****************
        //  * Export
        //  ****************/
        // "/api/export/matter/$matter_id"(controller: "export") {
        //     action = [GET: 'exportMatter']
        // }
        /**
         * Microservices
         */
        "/services/favicon"(controller: 'favicon') {
            action = [GET: 'index']
        }
        "/services/unsplashproxy/search/photos"(controller: 'unsplash') {
            action = ['GET': 'unsplashproxy']
        }
        "/services/unsplashproxy/photos/**"(controller: 'unsplash') {
            action = ['GET': 'unsplashdownload']
        }

        /****************
         * Misc
         ****************/
        "/"(controller: "spaIndex") {
            action = [GET: 'index']
        }
        "/health"(controller: "health") {
            action = [GET: 'index']
        }
        "/version"(controller: 'version') {
            action = [GET: 'index']
        }

        "/mstoken"(controller: 'microsoftResponse') {
            action = [GET: 'get']
        }

        "/oktatoken"(controller: 'oktaResponse') {
            action = [GET: 'get']
        }


        "/mslogin"(controller: 'microsoft') {
            action = [GET: 'index']
        }

        "/oktalogin"(controller: 'okta') {
            action = [GET: 'index']
        }

        "/saml/redirect"(controller: 'saml') {
            action = [GET: 'send', POST: 'receive']
        }

        "/api/admin/saml/settings"(controller: 'saml') {
            action = [GET: 'get', PATCH: 'update']
        }

        "/saml/metadata"(controller: 'samlMetadata', action: 'index')

        "/experimental"(controller: 'experimental') {
            action = [GET: 'index']
        }
        "/forgotpassword"(controller: 'forgotPassword') {
            action = ['POST': 'forgotPassword']
        }

        "/magicLink/decode"(controller: 'magicLink') {
            action:
            [POST: 'decodeMagicLink']
        }

        "/instance/settings"(controller: 'instanceSettings') {
            action = [GET: 'index']
        }

        "/instance/whitelist"(controller: 'emailWhitelist') {
            action = [GET: 'index']
        }

        "/instance/whitelist/$id"(controller: 'emailWhitelist') {
            action = [GET: 'show']
        }

        "/api/admin/instance/settings"(controller: 'instanceSettings') {
            action = [PATCH: 'update']
        }

        "/api/admin/instance/whitelist"(controller: 'emailWhitelist') {
            action = [POST: 'save']
        }

        "/api/admin/instance/whitelist/$id"(controller: 'emailWhitelist') {
            action = [DELETE: 'delete']
        }

        "/api/search"(controller: 'advancedSearch') {
            action = [GET: 'search']
        }

        "/error"(view: '/error')
        "500"(controller: "error", action: "handleAccessDenied", exception: Exception)
        "500"(controller: "error", action: "handleAccessDenied", exception: AccessDeniedException)
        "500"(controller: "error", action: "handleNoValidUserException", exception: NoValidUserException)
        "500"(controller: "error", action: "handleMaximumTaskLimitException", exception: MaximumTasksExceededException)
        "500"(controller: "error", action: "handleDuplicateTeamMemberException", exception: DuplicateTeamMemberException)
        "500"(controller: "error", action: "handleInvalidException", exception: IllegalArgumentException)
        "500"(controller: "error", action: "handleRequestParameterValidationFailed", exception: RequestParameterValidationFailedException)
        "500"(controller: "error", action: "handleHibernateOptimisticLockingFailureException", exception: HibernateOptimisticLockingFailureException)
        "500"(controller: "error", action: "handleInternalServerError")
        "401"(view: '/unauthorised')
        "404"(view: '/notFound')
    }
}