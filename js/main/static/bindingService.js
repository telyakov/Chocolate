var bindingService ={
    PARENT_ID_REG_EXP: /\[parentid\]/ig,
    FM_FIELD_REG_EXP: new RegExp('\\[.*?\\]', 'g'),
    /**
     * @param sql {string}
     * @param data {Object}
     * @returns {string}
     */
    fromParentData: function(sql, data){
        if(data.hasOwnProperty('id')){
            var parentID = data.id;
            return sql.replace(this.PARENT_ID_REG_EXP, parentID);
        }
        return sql;

    },
    /**
     * @param sql {string}
     * @param data {Object}
     * @returns {string}
     */
    fromData: function(sql, data){
        return sql.replace(this.FM_FIELD_REG_EXP, function(param){
            var prop = param.substring(1, param.length-1).toLowerCase();
            if(data.hasOwnProperty(prop)){
                return data[prop];
            }
            return param;
        });
    },
    bindSql: function(sql){
        var mainModule = chApp.getMain(),
            optionsModule = chApp.getOptions();

        var userID = mainModule.user.getID();
        return sql
            .replace(optionsModule.sql.params.userID, userID);
    }
};