
/**
 * Мастер создание поручений
 * @param ch_form {ChGridForm}
 */
function TaskWizard(ch_form) {
    MajesticWizard.apply(this, arguments);
    this.ch_form = ch_form;
    this.usersidlist = null;
    this.description = null;
    this.usersTitle = null;
}
TaskWizard.prototype = Object.create(MajesticWizard.prototype);
TaskWizard.prototype.cancel = function () {
};
TaskWizard.prototype.done = function () {
    var data = jQuery.extend({},this.ch_form.getDefaultObj());
    data.usersidlist = this.usersidlist;
    data.description = this.description;
    data.users = this.usersTitle;
    this.ch_form.addRow(data);

};
TaskWizard.prototype.openStep = function () {

};
TaskWizard.prototype.getStepCaption = function () {
    return '( Шаг ' + this.getCurrentStep() + ' из ' + this.getStepsCount() + ')';
};
TaskWizard.prototype.open = function(){
    this
        .enqueue(new SelectServiceTaskStep())
        .enqueue(new SelectExecutorsTaskStep())
        .enqueue(new SelectDescriptionTaskStep())
        .run();
};