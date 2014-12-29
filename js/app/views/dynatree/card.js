var CardDynatreeView = (function (Backbone, $) {
    'use strict';
    return Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this, 'render');
            //this.$el = options.$el;
            this.model = options.model;
            //this.render();
        },
        events: {},
        render: function (isSingle, name, view) {
            var options = {
                getParentID: function () {
                    return null;
                },
                checkbox: true,
                infoPanel: true,
                defaultValues: function () {
                    return this.data().editable.value;
                },
                okButton: function okButton($tree, $input) {
                    var chDynatree = this;
                    return {
                        'text': 'Сохранить',
                        'class': 'wizard-active wizard-next-button',
                        click: function () {
                            var selectedNodes = $tree.dynatree('getSelectedNodes'),
                                val = '',
                                selectedHtml = '',
                                isSelectAll = chDynatree.isSelectAll(),
                                i,
                                hasOwn = Object.prototype.hasOwnProperty;
                            for (i in selectedNodes) {
                                if (hasOwn.call(selectedNodes, i)) {
                                    var node = selectedNodes[i];
                                    if (isSelectAll || node.childList === null) {
                                        val += node.data.key;
                                        if (!chDynatree.isSingleMode()) {
                                            val += chDynatree.getSeparator();
                                        }
                                        if (i > 0) {
                                            selectedHtml += '/';
                                        }
                                        selectedHtml += node.data.title;
                                    }
                                }
                            }
                            $input.editable('setValue', val);
                            var data = {};
                            data[name] = val;
                            view.model.trigger('change:form', {
                                op: 'upd',
                                id: pk,
                                data: data
                            });
                            $input.html(selectedHtml);
                            $(this).dialog('close');
                        }
                    };
                }
            };
            if (isSingle) {
                options.selectMode = 1;
            }
            this.model.buildFromData(options);
        }
    });
})
(Backbone, jQuery);