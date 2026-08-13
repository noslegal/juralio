databaseChangeLog = {

    changeSet(author: "juralio (generated)", id: "1599648245000-1") {
        addColumn(tableName: "first_time_user_experience") {
            column(name: "has_seen_org_admin", type: "boolean")
        }
        addNotNullConstraint(defaultNullValue: "false", columnName: "has_seen_org_admin", tableName: "first_time_user_experience")
    }
}
