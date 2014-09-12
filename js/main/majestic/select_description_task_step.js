function SelectDescriptionTaskStep() {
    MajesticWizardMethod.apply(this, arguments);
}
SelectDescriptionTaskStep.prototype = Object.create(MajesticWizardMethod.prototype);
SelectDescriptionTaskStep.prototype.run = function (mjWizard) {
    var _this = this;
    var $content = $('<div class="widget-task-description"><div class="widget-header"><div class="widget-titles">Заполните описание</div><div class="widget-titles-content">Пожалуйста, заполните описание для вашего поручения</div></div></div>'),
        $text = $('<div class="widget-editable-input"></div>');
    $content.append($text)
    $text.editable({
        value: mjWizard.description,
        onblur: 'submit',
        mode: 'inline',
        type: 'textarea',
        display: true,
        inputclass: 'wizard-text',
        showbuttons: false
    });

    $text.editable('setValue',  mjWizard.description);
    openTaskWizardDialogEnd($content, mjWizard, this, 'Заполните описание '+mjWizard.getStepCaption(), $text)
}