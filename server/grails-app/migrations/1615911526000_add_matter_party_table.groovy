databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1615911526000 - 1) {
        createTable(tableName: "matter_party") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "matter_partyPK")
            }
            column(name: "version", type: "bigint", {
                constraints(nullable: "true")
            })
            column(name: "name", type: "varchar(255)", {
                constraints(nullable: "false")
            })
            column(name: "matter_id", type: "bigint", {
                constraints(nullable: "false")
            })
            column(name: "type", type: "varchar(255)", {
                constraints(nullable: "false")
            })
        }
    }

    changeSet(author: "juralio (generated)", id: 1615911526000 - 2) {
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "matter_party", constraintName: "FK_MATTER_ID_TO_MATTER", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true")
    }
}
