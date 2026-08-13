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

import com.juralio.AuditTrail
import com.juralio.costs.CostAssumption
import com.juralio.costs.CostSnapshot
import com.juralio.costs.Period
import com.juralio.costs.ProjectionPeriod
import com.juralio.costs.Rate
import com.juralio.costs.RateTableDetails
import com.juralio.costs.RateTableDetailsService
import com.juralio.instance.InstanceSettings
import com.juralio.instance.InstanceSettingsService
import com.juralio.label.Label
import com.juralio.matter.costs.CostRatio
import com.juralio.matter.costs.CostTimeEstimate
import com.juralio.matter.costs.MatterPricing
import com.juralio.matter.costs.OutOfScopeDetails
import com.juralio.matter.dao.MatterDAOService
import com.juralio.matterevent.MatterEvent
import com.juralio.matter.MatterParty
import com.juralio.matter.MatterPartyMember
import com.juralio.organisation.Organisation
import com.juralio.organisation.dao.OrganisationDAOService
import com.juralio.organisationgroup.MatterGroupPosition
import com.juralio.post.Post
import com.juralio.post.authors.PostAuthor
import com.juralio.post.members.PostMember
import com.juralio.project.Project
import com.juralio.task.Task
import com.juralio.task.follower.TaskFollower
import com.juralio.task.seenBy.TaskSeenBy
import com.juralio.task.team.TaskTeamMember
import com.juralio.usernotification.UserNotification
import grails.gorm.transactions.Transactional

import java.util.concurrent.TimeUnit

@Transactional
class MatterDeletionService {

    MatterDAOService matterDAOService
    OrganisationDAOService organisationDAOService
    InstanceSettingsService instanceSettingsService
    RateTableDetailsService rateTableDetailsService

    Matter getMatterForDeletion(long matterId) {
        return matterDAOService.get(matterId as long)
    }

    /**
     *
     * DO NOT CALL THIS, ONLY FOR CRON
     */
    private void deleteMatter(long matterId) {
        InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()
        Matter matter = getMatterForDeletion(matterId)
        if (!matter) {
            return
        }

        Matter deletedMirror

        if (matter.deletedMirror) {
            deletedMirror = getMatterForDeletion(matter.deletedMirror.id)
        }

        Map<Long, String> deletedItems = new HashMap<>()

        List<Post> posts = matter.projects.collect(({ Project p ->
            p.tasks.collect { Task t -> t.posts }
        } as Closure<Post>)).flatten()

        matter.projects.each { project ->
            project.tasks.each { Task task ->
                task.tasks.each { subtask ->
                    deletedItems.put(subtask.id, 'task.Task')
                    TaskTeamMember.findAllByTask(subtask).each { taskTeamMember ->
                        deletedItems.put(taskTeamMember.id, 'task.team.TaskTeamMember')
                    }
                    TaskFollower.findAllByTask(subtask).each { taskFollower ->
                        deletedItems.put(taskFollower.id, 'task.follower.TaskFollower')
                    }
                    TaskSeenBy.findAllByTask(subtask).each { seenBy ->
                        deletedItems.put(seenBy.id, 'task.seenBy.TaskSeenBy')
                    }
                }
                deletedItems.put(task.id, 'task.Task')
                TaskTeamMember.findAllByTask(task).each { taskTeamMember ->
                    deletedItems.put(taskTeamMember.id, 'task.team.TaskTeamMember')
                }
                TaskFollower.findAllByTask(task).each { taskFollower ->
                    deletedItems.put(taskFollower.id, 'task.follower.TaskFollower')
                }
                TaskSeenBy.findAllByTask(task).each { seenBy ->
                    deletedItems.put(seenBy.id, 'task.seenBy.TaskSeenBy')
                }
            }
            deletedItems.put(project.id, 'project.Project')
        }

        MatterAdmin.findAllByMatter(matter).each { matterAdmin ->
            deletedItems.put(matterAdmin.id, 'matter.MatterAdmin')
        }

        // CostAssumption and MatterGroupPosition belongsTo Matter but are not in Matter.hasMany,
        // so they are not cascade-deleted - remove them explicitly before deleting the matter.
        CostAssumption.findAllByMatter(matter).each { costAssumption ->
            deletedItems.put(costAssumption.id, 'matter.CostAssumptions')
            costAssumption.delete(flush: true)
        }

        MatterGroupPosition.findAllByMatter(matter).each { matterGroupPosition ->
            deletedItems.put(matterGroupPosition.id, 'organisationgroup.MatterGroupPosition')
            matterGroupPosition.delete(flush: true)
        }

        MatterTeamMember.findAllByMatter(matter).each { teamMember ->
            deletedItems.put(teamMember.id, 'matter.MatterTeamMember')
        }

        MatterViewer.findAllByMatter(matter).each { viewer ->
            deletedItems.put(viewer.id, 'matter.MatterViewer')
        }

        // MatterEvent (and its UserNotification children) belongsTo Matter but is not in Matter.hasMany,
        // so it is not cascade-deleted - remove it explicitly before deleting the matter.
        MatterEvent.findAllByMatter(matter).each { matterEvent ->
            UserNotification.findAllByMatterEvent(matterEvent).each { userNotification ->
                deletedItems.put(userNotification.id, 'usernotification.UserNotification')
                userNotification.delete(flush: true)
            }
            deletedItems.put(matterEvent.id, 'matterevent.MatterEvent')
            matterEvent.delete(flush: true)
        }

        MatterParty.findAllByMatter(matter).each { matterParty ->
            MatterPartyMember.findAllByMatterParty(matterParty).each { member ->
                deletedItems.put(member.id, 'matter.MatterPartyMember')
                member.delete(flush: true)
            }
            deletedItems.put(matterParty.id, 'matter.MatterParty')
            matterParty.delete(flush: true)
        }

        Label.findAllByMatter(matter).each { label ->
            deletedItems.put(label.id, 'label.Label')
            label.delete(flush: true)
        }
        Placeholders.findAllByMatter(matter).each { placeholder ->
            deletedItems.put(placeholder.id, 'placeholder.placeholders')
            placeholder.delete()
        }

        deletedItems.put(matter.id, 'matter.Matter')
        String deletedMatterId = matter.id.toString()

        // Delete matter-scoped children (posts, costs) BEFORE the matter row itself.
        // RateTableDetails.matter and CostRatio.matter are mapped lazy:false, so
        // querying them (deleteCostsData) after the matter row is deleted throws
        // FetchNotFoundException when it eager-resolves the now-gone matter.
        posts.each {
            deletedItems.put(it.id, 'post.Post')
            PostAuthor.findAllByPost(it).each { author ->
                deletedItems.put(author.id, 'post.authors.PostAuthor')
            }
            PostMember.findAllByPost(it).each { member ->
                deletedItems.put(member.id, 'post.members.PostMember')
            }
            it.delete(flush: true)
        }

        deleteCostsData(matter,deletedItems)

        matterDAOService.delete(matter)

        if (deletedMirror) {
            deleteMatter(deletedMirror.id)
        }

        // delete audit logs from user actions
        String userQuery = String.format("delete from AuditTrail a WHERE a.uri LIKE '/api/matter/%s%%' OR a.uri LIKE '/api/admin/matter/%s%%'", deletedMatterId, deletedMatterId)
        AuditTrail.executeUpdate(userQuery)

        // delete audit logs from deletion
        deletedItems.each {
            String deleteQuery = String.format("delete from AuditTrail a WHERE a.className = 'com.juralio.%s' AND a.persistedObjectId = '%s'", it.getValue(), it.getKey().toString())
            AuditTrail.executeUpdate(deleteQuery)
        }
    }

    void deleteCostsData(Matter matter,def deletedItems) {
        if (instanceSettingsService.getInstanceSettings().getCostsEnabled() && matter.organisation.costsEnabled && rateTableDetailsService.organisationRateTableDetails(matter.organisation.id).size() > 0) {
            List<RateTableDetails> rtds = RateTableDetails.findAllByMatter(matter)
            rtds.forEach { RateTableDetails rtd ->
                {
                    deletedItems.put(rtd.id, 'rtd')
                    List<Period> periods = Period.findAllByRateTableDetails(rtd)
                    List<Rate> rates = Rate.findAllByRateTableDetails(rtd)
                    // Delete rates before periods: Rate.period is mapped lazy:false,
                    // so a still-live Rate referencing a just-deleted Period would be
                    // re-saved by cascade on flush.
                    rates.forEach { Rate rate ->
                        {
                            deletedItems.put(rate.id, 'rate')
                            rate.delete(flush: true)
                        }
                    }
                    periods.forEach { Period period ->
                        {
                            deletedItems.put(period.id, 'period')
                            period.delete(flush: true)
                        }
                    }
                    rtd.delete(flush: true)
                }
            }
            // Delete in strict children-before-parent order. Several of these
            // associations are mapped lazy:false (CostRatio.costTimeEstimate,
            // Rate.period, ...); deleting a parent while a still-live child
            // references it triggers a "re-saved by cascade" flush error, and
            // loading a child whose eager parent was already deleted throws
            // FetchNotFoundException. So: CostRatio (-> CostTimeEstimate) and the
            // ProjectionPeriod dependents (MatterPricing, CostSnapshot) go before
            // the ProjectionPeriod / CostTimeEstimate rows themselves.
            List<CostRatio> costRatios = CostRatio.findAllByMatter(matter)
            costRatios.forEach { CostRatio costRatio ->
                {
                    deletedItems.put(costRatio.id, 'cost ratio')
                    costRatio.delete(flush: true)
                }
            }
            List<MatterPricing> matterPricings = MatterPricing.findAllByMatter(matter)
            matterPricings.forEach { MatterPricing matterPricing ->
                {
                    deletedItems.put(matterPricing.id, 'matter pricing')
                    matterPricing.delete(flush: true)
                }
            }
            List<CostSnapshot> costSnapshots = CostSnapshot.findAllByMatter(matter)
            costSnapshots.forEach { CostSnapshot costSnapshot ->
                {
                    deletedItems.put(costSnapshot.id, 'period')
                    costSnapshot.delete(flush: true)
                }
            }
            List<ProjectionPeriod> projectionPeriods = ProjectionPeriod.findAllByMatter(matter)
            projectionPeriods.forEach { ProjectionPeriod projectionPeriod ->
                {
                    deletedItems.put(projectionPeriod.id, 'projection period')
                    OutOfScopeDetails outOfScopeDetails = OutOfScopeDetails.findByProjectionPeriod(projectionPeriod)
                    if(outOfScopeDetails){
                        deletedItems.put(outOfScopeDetails.id, 'OutOfScopeDetails')
                        outOfScopeDetails.delete(flush: true)
                    }
                    List<CostTimeEstimate> costTimeEstimates = CostTimeEstimate.findAllByProjectionPeriod(projectionPeriod)
                    costTimeEstimates.forEach { CostTimeEstimate cte ->
                        {
                            deletedItems.put(cte.id, 'period')
                            cte.delete(flush: true)
                        }
                    }
                    projectionPeriod.delete(flush: true)
                }
            }
        }
    }

    /**
     *
     * DO NOT CALL THIS, ONLY FOR CRON
     */
    /**
     * DO NOT CALL THIS, ONLY FOR CRON — permanently deletes every matter in the
     * organisation (used when an organisation is permanently deleted).
     */
    void deleteAllMattersForOrg(Organisation org) {
        // deleteMatter() is designed to be called on an "owner" matter and
        // recursively deletes that matter's deletedMirror. Deleting a mirror row
        // directly while its owner is still live triggers a Hibernate
        // "deleted object would be re-saved by cascade" flush error, so exclude
        // mirror rows from the top-level loop and let the recursion remove them.
        List<Matter> matters = Matter.findAllByOrganisation(org)
        Set<Long> mirrorIds = matters.findResults { Matter m -> m.deletedMirror?.id } as Set
        matters.each { Matter matter ->
            if (!mirrorIds.contains(matter.id)) {
                deleteMatter(matter.id)
            }
        }
    }

    void deletePendingMattersForOrg() {
        List<Organisation> organisations = organisationDAOService.list().findAll { Organisation org -> org.enabled }
        organisations.each { Organisation organisation ->
            List<DeletedMatterLog> logs = DeletedMatterLog.findAllByOrganisationIdAndPermanentlyDeletedIsNull(organisation.id)
            if (logs.size() > 0) {
                logs.forEach {
                    if (it.permanentlyDeleted != null) {
                        return
                    }
                    long diffInMs = Math.abs(new Date().getTime() - it.markedForDeletion.getTime())
                    long daysSinceStart = TimeUnit.DAYS.convert(diffInMs, TimeUnit.MILLISECONDS)
                    if (daysSinceStart >= 30) {
                        deleteMatter(it.matterId)
                        it.permanentlyDeleted = new Date()
                    }
                }
            }

        }
    }
}
