
function openTaskWizardDialogEnd($content, mjWizard, mjMethod, title, $text) {
    var next_class = 'wizard-active wizard-next-button';
    $content.dialog({
        resizable: false,
        title: title,
        dialogClass: 'wizard-dialog',
        modal: true,
//        height: 500,
//        width: 700,
        buttons: {
            Next: {
                text: 'Добавить',
                'class': next_class,
                click: function (e, elem) {
                    var description = $(e.target).closest('div.wizard-dialog').find('.wizard-text').val()
                    if (typeof(description) != 'undefined') {
                        mjWizard.description = description;
                    }
                    $(this).dialog("close");
                    $(this).closest('div.ui-dialog').remove();
                    mjMethod.done(mjWizard);
                }},
            Cancel: {
                text: 'Отмена',
                'class': 'wizard-cancel-button',
                click: function () {
                    $(this).dialog("close");
                    mjMethod.cancel(mjWizard);

                }
            }
        }
    });
}