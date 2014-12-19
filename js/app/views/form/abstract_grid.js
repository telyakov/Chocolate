var AbstractGridView = (function (AbstractView, $, _) {
    'use strict';
    return AbstractView.extend({
        events: {
            'keydown .tablesorter': 'navigateHandler',
            'click tbody > tr': 'selectRowHandler',
            'click .menu-button-expand': 'contentExpandHandler'
        },
        navigateHandler: function (e) {
            if (['TABLE', 'SPAN'].indexOf(e.target.tagName) !== -1) {
                //span for ie fix
                var op = optionsModule,
                    keyCode = e.keyCode,
                    catchKeys = [
                        op.getKeyCode('up'),
                        op.getKeyCode('down'),
                        op.getKeyCode('del')
                    ];
                if (catchKeys.indexOf(keyCode) !== -1) {
                    var form = facade.getFactoryModule().makeChGridForm($(e.target).closest('form')),
                        $activeRow,
                        $nextRow;

                    if (keyCode === op.getKeyCode('del')) {
                        form.removeRows(form.getSelectedRows());
                    } else if ((e.ctrlKey || e.shiftKey) && [op.getKeyCode('up'), op.getKeyCode('down')].indexOf(keyCode) !== -1) {
                        $activeRow = form.getActiveRow();
                        if (keyCode === op.getKeyCode('down')) {
                            $nextRow = $activeRow.next('tr');
                        } else {
                            $nextRow = $activeRow.prev('tr');
                        }
                        if ($nextRow.length) {
                            form.setCorrectScroll($nextRow);
                            form.selectRow($nextRow, true, false);
                        }
                    } else if ([op.getKeyCode('up'), op.getKeyCode('down')].indexOf(keyCode) !== -1) {
                        $activeRow = form.getActiveRow();
                        if (keyCode === op.getKeyCode('up')) {
                            $nextRow = $activeRow.prev('tr');
                        } else {
                            $nextRow = $activeRow.next('tr');
                        }
                        if ($nextRow.length) {
                            form.setCorrectScroll($nextRow);
                            form.selectRow($nextRow, false, false);
                        }
                    }
                    return false;
                }
            }
            return true;
        },
        selectRowHandler: function (e) {
            var $this = $(e.target).closest('tr'),
                form = facade.getFactoryModule().makeChGridForm($this.closest('form'));
            form.selectRow($this, e.ctrlKey || e.shiftKey, true);
        },
        layoutFooter: function ($form) {
            $form.after(this.footerTemplate());
        }
    });
})(AbstractView, jQuery, _);