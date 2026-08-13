databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1644504704000 - 1) {
        createTable(tableName: "matter_viewer") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "matter_viewerPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "date_created", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "false")
            }

            column(name: "last_updated", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "false")
            }

            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "matter_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: 1644504704000 - 2) {
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "matter_viewer", constraintName: "FKl0ejhfiyb3lyarwd3a2egp5uk", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: 1644504704000 - 3) {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "matter_viewer", constraintName: "FKl0ejhfiyb3lyarwd3a2egp6uk", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }
}
