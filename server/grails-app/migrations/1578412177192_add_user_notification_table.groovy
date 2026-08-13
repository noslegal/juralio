databaseChangeLog = {

    changeSet(author: "juralio (generated)", id: "1578497468031-13") {
        createTable(tableName: "user_inbox_notification") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "user_inbox_notificationPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "notification_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1578497468031-14") {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "user_inbox_notification", constraintName: "FK1jsvgeqj3gw2esmmrlrb7aoa5", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1578497468031-15") {
        addForeignKeyConstraint(baseColumnNames: "notification_id", baseTableName: "user_inbox_notification", constraintName: "FK1prkedre1tskpu4bdckccjebg", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "inbox_notification", validate: "true")
    }
}
