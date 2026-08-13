databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1616591824000 - 1) {
        sql '''
            ALTER TABLE user_auth_token
            ADD teams_ejection_partial  VARCHAR(255)
        '''
    }
}
