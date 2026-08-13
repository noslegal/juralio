databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1616149767000 - 1) {
        createTable(tableName: "matter_party_member") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "matter_party_memberPK")
            }
            column(name: "version", type: "bigint", {
                constraints(nullable: "true")
            })
            column(name: "matter_party_id", type: "bigint", {
                constraints(nullable: "false")
            })
            column(name: "user_id", type: "bigint", {
                constraints(nullable: "false")
            })
        }
    }

    changeSet(author: "juralio (generated)", id: 1616149767000 - 2) {
        addForeignKeyConstraint(baseColumnNames: "matter_party_id", baseTableName: "matter_party_member", constraintName: "matter_party_member_matter_party_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter_party", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: 1616149767000 - 3) {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "matter_party_member", constraintName: "matter_party_member_user_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }
}
