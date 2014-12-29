var ColumnDynatreeView = (function (Backbone, $) {
    'use strict';
    return Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this, 'render');
            //this.$el = options.$el;
            this.model = options.model;
            //this.render();
        },
        events: {},
        render: function (isSingle, title) {
            var options = {};
            options.getParentID = function (node) {
                return null;
            };
            if (isSingle) {
                options.selectMode = 1;
            }
            options.checkbox = true;

            options.okButton = function ($tree, $input, $checkbox, $select) {
                var chDynatree = this;
                return {
                    'text': 'Сохранить',
                    'class': 'wizard-active wizard-next-button',
                    click: function (bt, elem) {
                        var selected_nodes = $tree.dynatree("getSelectedNodes");
                        var val = '', select_html = '';
                        var is_select_all = chDynatree.isSelectAll();
                        for (var i in selected_nodes) {
                            var node = selected_nodes[i];
                            if (is_select_all || node.childList === null) {
                                val += node.data.key;
                                if (!chDynatree.isSingleMode()) {
                                    val += chDynatree.getSeparator();
                                }
                                if (i > 0) {
                                    select_html += '/';
                                }
                                select_html += node.data.title;
                            }
                        }
                        //todo: вернуть код
                        //var column = facade.getFactoryModule().makeChGridColumnBody($input);
                        var name = $input.data().editable.options.name;
                        //column.setChangedValue(name, val);
                        $input.attr('data-value', val);
                        $input.html(select_html);
                        $checkbox.children('input').attr('checked', false);
                        $(this).dialog("close");
                    }
                };
            };
            options.infoPanel = true;
            options.defaultValues = function () {
                return this.attr('data-value');
            };
            options.title = title;
            this.model.buildFromData(options);
        }
    });
})
(Backbone, jQuery);