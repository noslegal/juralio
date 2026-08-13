databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1779800100000-1") {
        createTable(tableName: "notification_preference") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "notification_preferencePK")
            }
            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }
            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
            column(name: "event_type", type: "VARCHAR(100)") {
                constraints(nullable: "false")
            }
            column(name: "enabled", type: "BOOLEAN", defaultValueBoolean: true) {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1779800100000-2") {
        addUniqueConstraint(
            tableName: "notification_preference",
            columnNames: "user_id, event_type",
            constraintName: "uk_notification_preference_user_event"
        )
    }

    changeSet(author: "juralio (generated)", id: "1779800100000-3") {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "notification_preference", constraintName: "FK_notification_preference_user_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }
}
