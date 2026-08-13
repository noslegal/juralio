databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1581072523000 - 1) {
        addColumn(tableName: "user_inbox_notification") {
            column(name: "read", type: "boolean")
        }
    }
}
