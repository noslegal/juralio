databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1615907930000-1") {
        createTable(tableName: "external_user") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "external_userPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1615907930000-2") {
        addColumn(tableName: "app_user") {
            column(name: "external_user_id", type: "BIGINT", defaultValue: null) {
                constraints(nullable: "true")
            }
        }
        addForeignKeyConstraint(baseColumnNames: "external_user_id", baseTableName: "app_user", constraintName: "FK_EXTERNAL_USER_ID_TO_USER_ID_160321", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "external_user", validate: "true")
    }
}
