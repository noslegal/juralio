databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1653916623000 - 1) {
        sql('''
  		    ALTER TABLE instance_settings ADD COLUMN enable_forgot_my_password BOOLEAN NOT NULL DEFAULT false;
        ''')
        sql('''
  		    ALTER TABLE app_user ADD COLUMN one_time_password_reset varchar(255);
        ''')
    }
}
