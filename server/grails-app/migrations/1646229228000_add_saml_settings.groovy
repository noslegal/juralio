databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1646229228000 - 1) {
        sql('''
  		    ALTER TABLE instance_settings ADD COLUMN saml_sso_enabled BOOLEAN NOT NULL DEFAULT false;
        ''')
        sql('''
  		    ALTER TABLE organisation ADD COLUMN saml_sso_enabled BOOLEAN NOT NULL DEFAULT false;
        ''')
        createTable(tableName: "saml_settings") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "saml_settings_PK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "identity_provider_entity_id", type: "varchar(255)") {
                constraints(nullable: "true")
            }

            column(name: "identity_provider_sso_url", type: "varchar(255)") {
                constraints(nullable: "true")
            }
            column(name: "service_provider_meta_data", type: "varchar(8000)") {
                constraints(nullable: "true")
            }
            column(name: "identity_provider_certificate", type: "varchar(8000)") {
                constraints(nullable: "true")
            }
        }
        sql('''
            insert into saml_settings (version,identity_provider_entity_id,identity_provider_sso_url,service_provider_meta_data,identity_provider_certificate)
            values (0,null,null,null,null)
        ''')
    }
}
