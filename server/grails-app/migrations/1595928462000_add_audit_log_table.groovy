databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1595928462000 - 1) {
        createTable(tableName: "audit_log") {
            column(name: "id", type: "int8") {
                constraints(nullable: "false", primaryKey: "true", primaryKeyName: "audit_logPK")
            }
            column(name: "actor", type: "text")
            column(name: "uri", type: "text")
            column(name: "class_name", type: "text")
            column(name: "persisted_object_id", type: "text")
            column(name: "persisted_object_version", type: "int8")

            column(name: "event_name", type: "text")
            column(name: "property_name", type: "text")
            column(name: "old_value", type: "text")
            column(name: "new_value", type: "text")

            column(name: "date_created", type: "timestamp")
            column(name: "last_updated", type: "timestamp")
        }
    }
}
