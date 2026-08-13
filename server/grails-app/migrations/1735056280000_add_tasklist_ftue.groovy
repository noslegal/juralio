databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1735056280000-1) {
    addColumn(tableName: "first_time_user_experience") {
            column(name: "has_seen_tasklist", type: "boolean")
        }
        addNotNullConstraint(defaultNullValue: "false", columnName: "has_seen_tasklist", tableName: "first_time_user_experience")  
    }
}