
function RemoveVarMethod(code, ch_form) {
    MajesticMethod.apply(this, arguments);
}
RemoveVarMethod.prototype = Object.create(MajesticMethod.prototype);
RemoveVarMethod.prototype.run = function () {
    var param_name = this.getParams()[0];
    MajesticVars.remove(param_name, this.ch_form.getID());
}