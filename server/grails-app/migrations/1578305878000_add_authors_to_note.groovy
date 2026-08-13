databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1578305878000-10") {
        createTable(tableName: "post_author") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "post_authorPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "note_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1578305878000-11") {
        addUniqueConstraint(columnNames: "note_id, user_id", constraintName: "UK3fb90a9134f07e57c8c597132bcd", tableName: "post_author")
    }

    changeSet(author: "juralio (generated)", id: "1578305878000-12") {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "post_author", constraintName: "FK1wg63dj67cg3ejpmv4cb4ce33", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1578305878000-13") {
        addForeignKeyConstraint(baseColumnNames: "note_id", baseTableName: "post_author", constraintName: "FKicbd88jdegbd1cqch28c9cdeb", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "note", validate: "true")
    }
}
