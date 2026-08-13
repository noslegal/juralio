databaseChangeLog = {
    changeSet(author: "juralio", id: 1784620800000-1) {
        dropForeignKeyConstraint(baseTableName: "marketplace_project_favourite", constraintName: "FKm0n7to7m0wlwwqynf0qxr358t")
    }
    changeSet(author: "juralio", id: 1784620800000-2) {
        dropTable(tableName: "marketplace_project_favourite")
    }
}
