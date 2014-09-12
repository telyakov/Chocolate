function SetVarMethod(code, ch_form) {
    MajesticMethod.apply(this, arguments);
}
SetVarMethod.prototype = Object.create(MajesticMethod.prototype);
SetVarMethod.prototype.run = function () {
    var parts = this.code.split(MajesticMethod.set_expression_separator),
        name = jQuery.trim(parts[0]),
        method = jQuery.trim(parts[1]),
        mjMethod = MajesticMethodFactory.create(method, this.ch_form),
        value = mjMethod.run();
    MajesticVars.set(name, value, this.ch_form.getID());
}