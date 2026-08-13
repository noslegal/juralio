// PBI-10: drops the decommissioned InboxNotification tables.
//
// PREPARED BUT NOT RUN. This changelog is intentionally NOT wired into
// changelog.groovy. The old write path is removed and the bell/inbox read the
// MatterEvent-backed /api/usernotifications API, so these tables only hold
// historical rows. Wire in the `include file:` line in changelog.groovy once the
// data has been retained long enough to satisfy the agreed drain window (~30 days).
//
// NOTE: notification_filter_user_recency is deliberately NOT dropped — it backs a
// live home-inbox filter feature, not the decommissioned notification path.
databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1782345600000-1") {
        dropTable(tableName: "user_inbox_notification", cascadeConstraints: true)
    }

    changeSet(author: "juralio (generated)", id: "1782345600000-2") {
        dropTable(tableName: "inbox_notification", cascadeConstraints: true)
    }
}
