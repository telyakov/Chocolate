function MajesticWizardMethod() {
}
MajesticWizardMethod.prototype = {
    run: function (mjWizard) {
        throw 'Необходимо реализовать метод run Для MajesticWizardMethod';
    },
    done: function (mjWizard) {
        mjWizard.next();
    },
    cancel: function (mjWizard) {
        mjWizard.cancel();
    }
}