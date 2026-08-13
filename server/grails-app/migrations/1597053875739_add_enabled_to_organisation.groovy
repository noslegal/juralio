databaseChangeLog = {

    changeSet(author: "juralio (generated)", id: "1597053875739-29") {
        addColumn(tableName: "organisation") {
            column(name: "enabled", type: "boolean")
        }
        addNotNullConstraint(defaultNullValue: "true", columnName: "enabled", tableName: "organisation")
    }

}
