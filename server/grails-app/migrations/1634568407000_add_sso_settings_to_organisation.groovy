databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1634568407000 - 1) {
        addColumn(tableName: "organisation") {
            column(name: "microsoft_sso_enabled", type: "boolean", valueBoolean: false)
        }
        addColumn(tableName: "organisation") {
            column(name: "okta_sso_enabled", type: "boolean", valueBoolean: false)
        }
        addDefaultValue(tableName: "organisation", columnName: "microsoft_sso_enabled", defaultValueBoolean: false)
        addDefaultValue(tableName: "organisation", columnName: "okta_sso_enabled", defaultValueBoolean: false)
    }
}
