var FormDynatreeView = (function (Backbone, $) {
    'use strict';
    return Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this, 'render');
            this.model = options.model;
            this.dataModel = options.dataModel;
        },
        events: {},
        render: function (isSingle, title, key, pk) {
            var dataModel = this.dataModel,
                options = {};
            options.getParentID = function () {
                return null;
            };
            if (isSingle) {
                options.selectMode = 1;
            }
            options.checkbox = true;
            options.okButton = function ($tree, $input, $checkbox) {
                var chDynatree = this;
                return {
                    'text': 'Сохранить',
                    'class': 'wizard-active wizard-next-button',
                    click: function () {
                        var selectedNodes = $tree.dynatree('getSelectedNodes'),
                            val = '',
                            html = '',
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
                                        html += '/';
                                    }
                                    html += node.data.title;
                                }
                            }
                        }
                        var data = {};
                        data[key] = val;
                        dataModel.trigger('change:form', {
                            op: 'upd',
                            id: pk,
                            data: data
                        });
                        $input.editable('setValue', val);
                        $input.html(html);
                        $checkbox.children('input').attr('checked', false);
                        $(this).dialog("close");
                    }
                };
            };
            options.infoPanel = true;
            options.defaultValues = function () {
                return this.data().editable.value;
            };
            options.title = title;
            this.model.buildFromData(options);
        }
    });
})
(Backbone, jQuery);