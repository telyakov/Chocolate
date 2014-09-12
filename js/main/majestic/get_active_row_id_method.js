
function GetActiveRowIDMethod(code, ch_form) {
    MajesticMethod.apply(this, arguments);
}

GetActiveRowIDMethod.prototype = Object.create(MajesticMethod.prototype);
GetActiveRowIDMethod.prototype.run = function () {
    var id = this.ch_form.getActiveRowID();
    if (typeof(id) == 'undefined') {
        id = null;
    }
    return id;
}
