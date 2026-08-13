databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1643891487000 - 1) {
        addColumn(tableName: "inactive_label") {
            column(name: "last_updated", type: "timestamp") {
                constraints(nullable: "true")
            }
        }
    }
    changeSet(author: "juralio (generated)", id: 1643891487000 - 2) {
        update(tableName: "inactive_label") {
            column(name: "last_updated", valueDate: "2022-02-03")
            where {
                "last_updated is NULL"
            }
        }
    }
    changeSet(author: "juralio (generated)", id: 1643891487000 - 3) {
        addNotNullConstraint(columnDataType: "timestamp", columnName: "last_updated", tableName: "inactive_label")
    }
    changeSet(author: "juralio (generated)", id: 1643891487000 - 4) {
        addColumn(tableName: "inactive_label") {
            column(name: "date_created", type: "timestamp") {
                constraints(nullable: "true")
            }
        }
    }
    changeSet(author: "juralio (generated)", id: 1643891487000 - 5) {
        update(tableName: "inactive_label") {
            column(name: "date_created", valueDate: "2022-02-03")
            where {
                "last_updated is NULL"
            }
        }
    }
    changeSet(author: "juralio (generated)", id: 1643891487000 - 6) {
        addNotNullConstraint(columnDataType: "timestamp", columnName: "date_created", tableName: "inactive_label")
    }
}
