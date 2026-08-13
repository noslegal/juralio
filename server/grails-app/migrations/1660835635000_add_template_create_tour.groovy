databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1660835635000 - 1) {
        addColumn(tableName: "tour") {
            column(name: "template_create", type: "boolean", defaultValueBoolean: false)
        }
    }
}
