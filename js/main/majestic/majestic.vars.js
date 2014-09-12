
var MajesticVars = {
    EXECUTE_URL: '/majestic/execute',
    params: [],
    get: function (name, form_id) {
        return this.params[form_id][name.toLowerCase()];
    },
    set: function (name, value, form_id) {
        this.params[form_id][name.toLowerCase()] = value;
    },
    clear: function (form_id) {
        this.params[form_id] = [];
    },
    remove: function (name, form_id) {
        delete this.params[form_id][name.toLowerCase()];
    }
}