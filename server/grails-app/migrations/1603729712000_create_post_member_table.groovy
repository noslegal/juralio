databaseChangeLog = {

    changeSet(author: "juralio (generated)", id: "1603729712000-1") {
        createTable(tableName: "post_member") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "post_memberPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "post_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1603729712000-2") {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "post_member", constraintName: "FK_USER_ID_TO_USER", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1603729712000-3") {
        addForeignKeyConstraint(baseColumnNames: "post_id", baseTableName: "post_member", constraintName: "FK_POST_ID_TO_POST", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "post", validate: "true")
    }
}
