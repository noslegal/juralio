databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1750235378000-1) {
        addColumn(tableName: "first_time_user_experience") {
            column(name: "has_seen_matter_admin", type: "boolean")
        }
        addNotNullConstraint(defaultNullValue: "false", columnName: "has_seen_matter_admin", tableName: "first_time_user_experience")
    }
}
