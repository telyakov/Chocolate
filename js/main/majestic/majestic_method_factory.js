
var MajesticMethodFactory = {
    /**
     * @param ch_form {ChGridForm}
     * @param code
     * @returns {MajesticMethod}
     */
    create: function (code, ch_form) {
        var code = jQuery.trim(code);
        if (this._isSetExpression()) {
            return new SetVarMethod(code, ch_form);
        } else {
            switch (code.toLowerCase()) {
                case 'vars.clear':
                    return new ClearVarsMethod(code, ch_form);
                    break;
                case 'dataform.currentrowid':
                    return new GetActiveRowIDMethod(code, ch_form);
                    break;
                case 'vars.remove':
                    return new RemoveVarMethod(code, ch_form)
                    break;

            }

        }
        return this.code;
    },
    _isSetExpression: function () {
        return this.code.indexOf(MajesticMethod.set_expression_separator) != -1;
    }
};