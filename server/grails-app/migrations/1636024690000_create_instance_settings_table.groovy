databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1636024690000 - 1) {
        createTable(tableName: "instance_settings") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "instance_settings_PK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "microsoft_sso_enabled", type: "boolean", valueBoolean: false) {
                constraints(nullable: "false")
            }

            column(name: "okta_sso_enabled", type: "boolean", valueBoolean: false) {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: 1636024690000 - 2) {
        sql('''
            insert into instance_settings (microsoft_sso_enabled,okta_sso_enabled,version)
            values (false,false,1)
        ''')
    }
}
