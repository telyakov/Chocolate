/**
 * taskWizard dependencies from dynatree, editable
 */
var taskWizard = (function ($, socketModule, undefined, mediator, optionsModule, helpersModule) {
    'use strict';
    var _private = {
        makeCommandObj: function (form) {
            return {
                form: form,
                serviceID: null,
                userIdList: null,
                description: null,
                userNames: null
            };
        },
        onServiceCommand: function (data, id) {
            var $cnt = $('#' + id),
                commandObj = $cnt.data('chWizard').commandObj,
                map = {},
                node,
                roots = [],
                searchData = [],
                hasOwn = Object.prototype.hasOwnProperty,
                i;
            for (i in data) {
                if (hasOwn.call(data, i)) {
                    node = data[i];
                    node.title = node.name;
                    node.key = i;
                    node.icon = false;
                    node.children = [];
                    map[node.id] = i;
                    if (node.parentid) {
                        searchData.push({label: node.title, id: node.key});
                        data[map[node.parentid]].children.push(node);
                    } else {
                        roots.push(node);
                    }
                }
            }

            var $content = $('<div>'),
                $tree = $('<div>', {
                    'class': 'widget-tree'
                });
            $tree.dynatree({
                children: roots,
                selectMode: 1,
                onQueryActivate: function (flag, node) {
                    return node.data.children.length === 0;
                },
                onRender: function (node, nodeSpan) {
                    if (node.data.children.length === 0) {
                        $(nodeSpan)
                            .attr('data-id', node.data.id)
                            .attr('data-title', node.data.title.toLowerCase());
                    }
                },
                onActivate: function (node) {
                    commandObj.serviceid = node.data.id;
                    commandObj.description = node.data.description;
                    commandObj.usersidlist = node.data.usersidlist;
                    var $nxtBtn = $(node.span).closest('.ui-widget').find('.wizard-next-button.wizard-no-active');
                    $nxtBtn.removeClass('wizard-no-active').addClass('wizard-active');
                }
            });
            $tree.dynatree("getRoot").visit(function (node) {
                node.expand(true);
            });
            var $search = $('<input>', {
                    type: 'text'
                }),
                $header = $('<div>', {
                    'class': 'widget-header-tree'
                });

            $header.append($search);
            $content.prepend($header);
            $content.append($tree);
            _private.dialogOpen($content, $cnt, false, commandObj, function () {
                $(this).trigger('next.chWizard');
            });
            $search.autocomplete({
                delay: 100,
                source: function (request, response) {
                    var search = helpersModule.engToRus(request.term.toLowerCase());
                    $content.find('.node-searched').removeClass('node-searched');
                    $content.find('[data-title*=\'' + search + '\']').addClass('node-searched');
                    response(searchData.filter(helpersModule.filterSearchData(search, 'label')));
                },
                close: function () {
                    $content.find('.node-searched').removeClass('node-searched');
                },
                select: function (event, ui) {
                    $content.find('.node-searched').removeClass('node-searched');
                    $tree.dynatree('getTree').activateKey(ui.item.id);
                }
            });
        },
        onExecutorsCommand: function (data, id) {
            var $cnt = $('#' + id),
                commandObj = $cnt.data('chWizard').commandObj,
                $select = $('<div>', {
                    'class': 'wizard-select2'
                }),
                dynatreeElem = facade.getFactoryModule().makeChDynatree($select),
                options = {};

            options.getInput = function () {
                return $select;
            };
            options.isDialogEvent = false;
            options.defaultValues = function () {
                return commandObj.usersidlist;
            };
            options.column_title = 'name';
            options.root_id = 'parentid';
            options.column_id = 'id';
            options.infoPanel = true;
            options.separator = '|';
            options.children = data;
            options.checkbox = true;
            var $newCont = dynatreeElem.buildFromData(options);
            _private.dialogOpen($newCont, $cnt, true, commandObj, function (commandObj, $content) {
                commandObj.usersidlist = '';
                commandObj.usersTitle = '';
                var i,
                    data,
                    selectedNodes = $content.find('.widget-tree').dynatree('getSelectedNodes'),
                    hasOwn = Object.prototype.hasOwnProperty;
                for (i in selectedNodes) {
                    if (hasOwn.call(selectedNodes, i)) {
                        data = selectedNodes[i].data;
                        commandObj.usersidlist += data.id + '|';
                        if (commandObj.usersTitle) {
                            commandObj.usersTitle += '/';
                        }
                        commandObj.usersTitle += data.title;
                    }
                }
                $(this).trigger('next.chWizard');
            });
        },
        onDoneFn: function () {
            return function ($cnt) {
                var commandObj = $cnt.data('chWizard').commandObj,
                    form = commandObj.form,
                    data = $.extend({}, form.getDefaultObj());
                data.usersidlist = commandObj.usersidlist;
                data.description = commandObj.description;
                data.users = commandObj.usersTitle;
                data.serviceid = commandObj.serviceID;
                form.addRow(data);
            };
        },
        title: function ($cnt) {
            var data = $cnt.data('chWizard'), step = data.currentStep + 1;
            return 'Шаг (' + step + ' из ' + data.commands.length + ')';
        },
        dialogOpen: function ($data, $cnt, isActiveNext, commandObj, doneFn) {
            var btnNextClass;
            if (isActiveNext) {
                btnNextClass = 'wizard-active wizard-next-button';
            } else {
                btnNextClass = 'wizard-no-active wizard-next-button';
            }
            $data.dialog({
                resizable: false,
                title: _private.title($cnt),
                dialogClass: 'wizard-dialog',
                modal: true,
                buttons: {
                    Next: {
                        text: 'Далее >',
                        'class': btnNextClass,
                        click: function () {
                            var $this = $(this),
                                $nextBtn = $this.parent().find('.wizard-next-button.wizard-no-active');
                            if (isActiveNext || !$nextBtn.length) {
                                $this.dialog('close');
                                $this.closest('.ui-dialog').remove();
                                doneFn.call($cnt, commandObj, $data);
                                return true;
                            } else {
                                var $error = $('<span>', {
                                        text: 'Выберите элемент',
                                        'class': 'wizard-error ui-dialog-title'
                                    }),
                                    $placement = $this.closest('.ui-dialog').children('.ui-dialog-titlebar');
                                $error
                                    .appendTo($placement)
                                    .delay(3000)
                                    .queue(function () {
                                        $(this).remove();
                                    });

                                return false;

                            }
                        }},
                    Cancel: {
                        text: 'Отмена',
                        'class': 'wizard-cancel-button',
                        click: function () {
                            $(this).dialog("close");
                            $cnt.chWizard('destroy');

                        }
                    }
                }
            });
        },
        end: function ($data, commandObj, $cnt) {
            $data.dialog({
                resizable: false,
                title: _private.title($cnt),
                dialogClass: 'wizard-dialog',
                modal: true,
                buttons: {
                    Next: {
                        text: 'Добавить',
                        'class': 'wizard-active wizard-next-button',
                        click: function (e) {
                            var description = $(e.target).closest('.wizard-dialog').find('.wizard-text').val();
                            if (description !== 'undefined') {
                                commandObj.description = description;
                            }
                            var $this = $(this);
                            $this.dialog('close');
                            $this.closest('.ui-dialog').remove();
                            $cnt.trigger('next.chWizard');
                        }},
                    Cancel: {
                        text: 'Отмена',
                        'class': 'wizard-cancel-button',
                        click: function () {
                            $(this).dialog('close');
                            $cnt.chWizard('destroy');
                        }
                    }
                }
            });
        }
    };
    return {
        /**
         * @param form {ChGridForm}
         */
        makeCommandObject: function (form) {
            return _private.makeCommandObj(form);
        },
        onDoneFunc: function () {
            return _private.onDoneFn();
        },
        onServiceCommand: function (data, id) {
            _private.onServiceCommand(data, id);
        },
        makeServiceCommand: function () {
            return function ($cnt) {
                var channel = optionsModule.getChannel('socketRequest');
                mediator.publish(channel, {
                    type: optionsModule.getRequestType('wizardServices'),
                    query: optionsModule.getSql('getServices'),
                    id: $cnt.attr('id')
                });
            };
        },
        onExecutorsCommand: function (data, id) {
            _private.onExecutorsCommand(data, id);
        },
        makeExecutorsCommand: function () {
            return function ($cnt) {
                var commandObj = $cnt.data('chWizard').commandObj;
                if (optionsModule.getConstants('multiTaskService') === commandObj.serviceid) {
                    $cnt.trigger('next.chWizard');
                } else {
                    var channel = optionsModule.getChannel('socketRequest');
                    mediator.publish(channel, {
                        type: optionsModule.getRequestType('wizardExecutors'),
                        query: optionsModule.getSql('getExecutors'),
                        id: $cnt.attr('id')
                    });
                }
            };
        },
        makeDescriptionCommand: function () {
            return function ($cnt) {
                var commandObj = $cnt.data('chWizard').commandObj,
                    html = [
                        '<div class="widget-header">',
                        '<div class="widget-titles">',
                        'Заполните описание',
                        '</div>',
                        '<div class="widget-titles-content">',
                        'Пожалуйста, заполните описание для вашего поручения',
                        '</div>',
                        '</div>'
                    ].join(''),
                    $content = $('<div>', {
                        'class': 'widget-task-description',
                        html: html
                    }),
                    $text = $('<div>', {
                        'class': 'widget-editable-input'
                    });
                $content.append($text);
                $text.editable({
                    value: commandObj.description,
                    onblur: 'submit',
                    mode: 'inline',
                    type: 'textarea',
                    display: true,
                    inputclass: 'wizard-text',
                    showbuttons: false
                });
                $text.editable('setValue', commandObj.description);
                _private.end($content, commandObj, $cnt);
                $text.trigger('click');
            };
        }
    };
})(jQuery, socketModule, undefined, mediator, optionsModule, helpersModule);