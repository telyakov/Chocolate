function ClearVarsMethod(code, ch_form) {
    MajesticMethod.apply(this, arguments);
}
ClearVarsMethod.prototype = Object.create(MajesticMethod.prototype);
ClearVarsMethod.prototype.run = function () {
    MajesticVars.clear(this.ch_form.getID());
}