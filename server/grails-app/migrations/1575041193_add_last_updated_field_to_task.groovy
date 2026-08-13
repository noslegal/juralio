databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1575041193 - 1) {
        addColumn(tableName: "task") {
            column(name: "last_updated", type: "timestamp") {
                constraints(nullable: "true")
            }
        }
    }
    changeSet(author: "juralio (generated)", id: 1575041193 - 2) {
        update(tableName: "task") {
            column(name: "last_updated", valueDate: "2019-11-29")
            where {
                "last_updated is NULL"
            }
        }
    }
    changeSet(author: "juralio (generated)", id: 1575041193 - 3) {
        addNotNullConstraint(columnDataType: "timestamp", columnName: "last_updated", tableName: "task")
    }
}
