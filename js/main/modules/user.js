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
                var roles = storageModule.getUserRoles();
                if(Array.isArray(roles)){
                    return storageModule.getUserRoles().indexOf(role) !== -1;
                }else{
                    return false;
                }
            },
            setIdentity: function (name, id) {
                mediator.publish(optionsModule.getChannel('setIdentity'), id, name);
            },
            setRoles: function (roles) {
                mediator.publish(optionsModule.getChannel('setRoles'), roles);
            }
        };

})(moment, optionsModule, storageModule, mediator);