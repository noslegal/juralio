databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1635937999000 - 1) {
        addColumn(tableName: "tour") {
            column(name: "weblink_create", type: "boolean", defaultValueBoolean: false)
        }
    }
}
