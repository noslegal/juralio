databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1614260893000 - 1) {
        createTable(tableName: "experimental_options") {
            column(name: 'microsoft_login', type: 'boolean', {
                constraints(nullable: "false", defaultValue: false)
            })
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
            }
            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

        }
        createTable(tableName: "experimental_server") {
            column(name: 'url', type: 'varchar(5000)', {
                constraints(nullable: "true", defaultValue: null)
            })
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "url")
            }
            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
        // experimental_server is a referrer allowlist: a request whose Referer matches a
        // row here gets experimental features (see ExperimentalService.isExperimental).
        // Only the local dev origin is seeded — add your own deployed origins as needed.
        sql('''
            insert into experimental_server (url,version)
            values ('http://localhost:3000',1)
        ''')
        sql('''
            insert into experimental_options (microsoft_login,version)
            values (true,1)
        ''')

    }
}
