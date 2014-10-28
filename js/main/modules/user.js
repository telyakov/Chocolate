/**
 * User module. Dependencies moment.js, optionsModule, storageModule, mediator
 */
var userModule = (function (moment, optionsModule, storageModule, mediator) {
    var context = this,
        _private = {
            getName: function () {
                return storageModule.getUserName();
            },
            getSign: function () {
                return [
                    '',
                    _private.getName(),
                    moment(new Date()).format(optionsModule.getSetting('signatureFormat')),
                    ''
                ].join(' ');
            },
            getID: function () {
                return storageModule.getUserID();
            },
            hasRole: function (role) {
                var prepareRole = role.toLowerCase(),
                    roles = storageModule.getUserRoles();
                if(Array.isArray(roles)){
                    return storageModule.getUserRoles().indexOf(prepareRole) !== -1;
                }else{
                    return false;
                }
            }
        };
    return{
        getSign: function(){
            return _private.getSign();
        },
        getID: function(){
            return _private.getID();
        },
        hasRole: function(role){
            return _private.hasRole(role);
        }
    };

})(moment, optionsModule, storageModule, mediator);