databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1581336877000 - 1) {
        addColumn(tableName: "user_inbox_notification") {
            column(name: "dismissed", type: "boolean", defaultValue: "false")
        }
    }
}
