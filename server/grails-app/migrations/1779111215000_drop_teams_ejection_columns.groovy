databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1779111215000-1) {
        dropColumn(columnName: "teams_ejection_partial", tableName: "app_user")
    }
    changeSet(author: "juralio (generated)", id: 1779111215000-2) {
        dropColumn(columnName: "teams_ejection_partial", tableName: "user_auth_token")
    }
}
