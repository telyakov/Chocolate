var bindingService ={
    PARENT_ID_REG_EXP: /\[parentid\]/ig,
    ENTITY_ID_REG_EXP: /\[entityid\]/ig,
    ENTITY_TYPE_ID_REG_EXP: /\[entitytypeid\]/ig,
    ENTITY_TYPE_REG_EXP: /\[entitytype\]/ig, // заменять на entity_type_id
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
     *
     * @param card {ChCard}
     * @param sql {String}
     */
    sqlInCard: function(card, sql){
        return sql
            .replace(this.PARENT_ID_REG_EXP, card.getKey())
            .replace(this.ENTITY_ID_REG_EXP, card.getKey())
            .replace(this.ENTITY_TYPE_ID_REG_EXP, card.getGridForm().getEntityTypeID())
            .replace(this.ENTITY_TYPE_REG_EXP, card.getGridForm().getEntityTypeID());
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
        var userModule = facade.getUserModule(),
            optionsModule = chApp.getOptions();

        var userID = userModule.getID();
        return sql
            .replace(optionsModule.sql.params.userID, userID);
    }
};