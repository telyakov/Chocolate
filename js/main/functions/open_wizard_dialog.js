function openWizardDialog($content, mjWizard, mjMethod, nextIsActive, title) {
    var next_class = 'wizard-no-active wizard-next-button'
    if (nextIsActive) {
        next_class = 'wizard-active wizard-next-button'
    }
    $content.dialog({
        resizable: false,
        title: title,
        dialogClass: 'wizard-dialog',
        modal: true,
//        height: 500,
//        width: 700,
        buttons: {
            Next: {
                text: 'Далее >',
                'class': next_class,
                click: function (bt, elem) {
                    if (nextIsActive) {
                        $(this).dialog("close");
                        $(this).closest('div.ui-dialog').remove();

                        mjMethod.done(mjWizard, $content);
                        return true;
                    }
                    var $nxt_btn = $(this).parent().find('button.wizard-next-button.wizard-no-active');
                    if ($nxt_btn.length > 0) {
                        //TODO: немодально сделать
                        alert("Сделайте действие.");
                        return false;
                    } else {
                        $(this).dialog("close");
                        $(this).closest('div.ui-dialog').remove();
                        mjMethod.done(mjWizard);
                    }
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