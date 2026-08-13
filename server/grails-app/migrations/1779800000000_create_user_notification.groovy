databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1779800000000-1") {
        createTable(tableName: "user_notification") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "user_notificationPK")
            }
            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }
            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
            column(name: "matter_event_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
            column(name: "read", type: "BOOLEAN", defaultValueBoolean: false) {
                constraints(nullable: "false")
            }
            column(name: "dismissed", type: "BOOLEAN", defaultValueBoolean: false) {
                constraints(nullable: "false")
            }
            column(name: "date_created", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1779800000000-2") {
        addUniqueConstraint(
            tableName: "user_notification",
            columnNames: "user_id, matter_event_id",
            constraintName: "uk_user_notification_user_event"
        )
    }

    changeSet(author: "juralio (generated)", id: "1779800000000-3") {
        sql('CREATE INDEX idx_user_notification_user_created ON user_notification (user_id, date_created DESC, id DESC)')
    }

    changeSet(author: "juralio (generated)", id: "1779800000000-4") {
        sql('CREATE INDEX idx_user_notification_user_unread ON user_notification (user_id) WHERE read = false')
    }

    changeSet(author: "juralio (generated)", id: "1779800000000-5") {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "user_notification", constraintName: "FK_user_notification_user_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1779800000000-6") {
        addForeignKeyConstraint(baseColumnNames: "matter_event_id", baseTableName: "user_notification", constraintName: "FK_user_notification_matter_event_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter_event", validate: "true")
    }
}
