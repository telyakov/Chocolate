var taskWizard = (function ($) {
    'use strict';
    var _private = {
        title: function ($cnt) {
            var data = $cnt.data('chWizard'), step = data.currentStep + 1;
            return '( Шаг ' + step + ' из ' + data.commands.length + ')';
        },
        open: function ($content, $cnt, nextIsActive, commandObj, doneFn) {
            var next_class = 'wizard-no-active wizard-next-button';
            if (nextIsActive) {
                next_class = 'wizard-active wizard-next-button';
            }
            $content.dialog({
                resizable: false,
                title: _private.title($cnt),
                dialogClass: 'wizard-dialog',
                modal: true,
                buttons: {
                    Next: {
                        text: 'Далее >',
                        'class': next_class,
                        click: function (bt, elem) {
                            if (nextIsActive) {
                                $(this).dialog("close");
                                $(this).closest('div.ui-dialog').remove();

                                doneFn.call($cnt, commandObj, $content);
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
                                doneFn.call($cnt, commandObj, $content);
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
        end: function ($content, commandObj, $cnt) {
            var next_class = 'wizard-active wizard-next-button';
            $content.dialog({
                resizable: false,
                title: _private.title($cnt),
                dialogClass: 'wizard-dialog',
                modal: true,
                buttons: {
                    Next: {
                        text: 'Добавить',
                        'class': next_class,
                        click: function (e, elem) {
                            var description = $(e.target).closest('div.wizard-dialog').find('.wizard-text').val();
                            if (typeof(description) !== 'undefined') {
                                commandObj.description = description;
                            }
                            $(this).dialog("close");
                            $(this).closest('div.ui-dialog').remove();
                            $cnt.trigger('next.chWizard');
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
        }
    };
    return {
        /**
         * @param form {ChGridForm}
         */
        makeCommandObject: function (form) {
            return {
                form: form,
                serviceID: null,
                userIdList: null,
                description: null,
                userNames: null
            };
        },
        onDoneFunc: function () {
            return function ($cnt, commandObj) {
                var form = commandObj.form,
                    data = $.extend({}, form.getDefaultObj());
                data.usersidlist = commandObj.usersidlist;
                data.description = commandObj.description;
                data.users = commandObj.usersTitle;
                data.serviceid = commandObj.serviceID;
                form.addRow(data);
            };
        },
        serviceCommand: function () {
            return function ($cnt, commandObj) {
                jQuery.get(
                    '/majestic/execute',
                    {cache: true, sql: 'Tasks.ServicesGet'},
                    function (response) {
                        var ch_response = new ChResponse(response);
                        if (ch_response.isSuccess()) {
                            var nodes = ch_response.getData(),
                                map = {}, node, roots = [], autocomplete_data = [];
                            for (var i in nodes) {
                                if (nodes.hasOwnProperty(i)) {

                                    node = nodes[i];
                                    node.title = node.name;
                                    node.key = i;
                                    node.icon = false;
                                    node.children = [];
                                    map[node.id] = i; // use map to look-up the parents
                                    if (node.parentid !== null) {
                                        autocomplete_data.push({label: node.title, id: node.key});
                                        nodes[map[node.parentid]].children.push(node);
                                    } else {

                                        roots.push(node);
                                    }
                                }
                            }
                            var $content = $('<div></div>');
                            var $tree = $('<div class="widget-tree"></div>');
                            $tree.dynatree({
                                children: roots,
                                selectMode: 1,
                                onQueryActivate: function (flag, node) {
                                    if (node.data.children.length === 0) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                },
                                onRender: function (node, nodeSpan) {
                                    if (node.data.children.length === 0) {

                                        $(nodeSpan).attr("data-id", node.data.id);
                                        $(nodeSpan).attr("data-title", node.data.title.toLowerCase());
                                    }
                                },
                                onActivate: function (node) {
                                    var desc = node.data.description,
                                        useridlist = node.data.usersidlist;
                                    commandObj.serviceid = node.data.id;
                                    commandObj.description = desc;
                                    commandObj.usersidlist = useridlist;
                                    var $span = $(node.span),
                                        $nxt_btn = $span.closest('div.ui-widget').find('button.wizard-next-button.wizard-no-active');
                                    $nxt_btn.removeClass('wizard-no-active').addClass('wizard-active');
                                }
                            });
                            $tree.dynatree("getRoot").visit(function (node) {
                                node.expand(true);
                            });
                            var $search = $('<input type="text">');
                            var $header = $('<div class="widget-header-tree"></div>');

                            $header.append($search);
                            $content.prepend($header);
                            $content.append($tree);
                            _private.open($content, $cnt, false, commandObj, function (commandObj, $content) {
                                $(this).trigger('next.chWizard');
                            });
                            $search.autocomplete({
                                delay: 100,
                                source: function (request, response) {
                                    var search = Chocolate.eng2rus(request.term.toLowerCase());
                                    $content.find('.node-searched').removeClass('node-searched');
                                    $content.find('[data-title*=\'' + search + '\']').addClass('node-searched');
                                    response(autocomplete_data.filter(chFunctions.filterSearchData(search, 'label')));
                                },
                                close: function (event, ui) {
                                    $content.find('.node-searched').removeClass('node-searched');

                                },
                                select: function (event, ui) {

                                    var id = ui.item.id;
                                    var $elem = $content.find('[data-id=' + id + ']');
                                    $content.find('.node-searched').removeClass('node-searched');
                                    $tree.dynatree("getTree").activateKey(id);

                                }
                            });
                        }
                        else {
                            alert("Произошла ошибка при открытии мастера поручений. Обратитесь к разработчикам.");
                        }
                    }
                ).
                    fail(function () {
                        alert("Произошла ошибка при открытии мастера поручений. Обратитесь к разработчикам.");
                    });
            };
        },
        executorsCommand: function () {
            return function ($cnt, commandObj) {
                if (chApp.getOptions().constants.multiTaskService === commandObj.serviceid) {
                    $cnt.trigger('next.chWizard');
                } else {
                    jQuery.get(
                        '/majestic/execute',
                        {cache: true, sql: 'tasks.uspGetUsersListForTasksUsers'},
                        function (response) {
                            var ch_response = new ChResponse(response);
                            var data = ch_response.getData();
                            var $content = $('<div><div class="widget-header"><div class="widget-titles">Выберите исполнителей</div><div class="widget-titles-content">Пожалуйста, выберите исполнителей вашего поручения</div></div></div>'),
                                $select = $('<div class="wizard-select2"></div>');

                            var dynatreeElem = facade.getFactoryModule().makeChDynatree($select);
                            var options = [];
                            options.getInput = function () {
                                return $select;
                            };
                            options.isDialogEvent = false;
                            options.defaultValues = function () {
                                return commandObj.usersidlist;
                            };
                            options.children = data;
                            options.column_title = 'name';
                            options.root_id = 'parentid';
                            options.column_id = 'id';
                            options.infoPanel = true;
                            options.separator = '|';
                            options.checkbox = true;
                            var $newCont = dynatreeElem.build(options);
                            _private.open($newCont, $cnt, true, commandObj, function (commandObj, $content) {
                                var selected_nodes = $content.find('.widget-tree').dynatree("getSelectedNodes");
                                var val = '', select_html = '';
                                commandObj.usersidlist = '';
                                commandObj.usersTitle = '';
                                for (var i in selected_nodes) {
                                    var data = selected_nodes[i].data;
                                    commandObj.usersidlist += data.id + '|';
                                    if (commandObj.usersTitle) {
                                        commandObj.usersTitle += '/';
                                    }
                                    commandObj.usersTitle += data.title;
                                }
                                $(this).trigger('next.chWizard');


                            });
                            var $checkbox = $('<span class="tree-checkbox"><input type="checkbox"><span class="tree-checkbox-caption">Выделить все</span></span>');
                            $newCont.next().prepend($checkbox);
                            ChDynatree.prototype.checkboxClickEvent($checkbox, $newCont.find('.widget-tree'))
                        }

                    );

                }
            };

        },
        descriptionCommand: function () {
            return function ($cnt, commandObj) {
                var $content = $('<div class="widget-task-description"><div class="widget-header"><div class="widget-titles">Заполните описание</div><div class="widget-titles-content">Пожалуйста, заполните описание для вашего поручения</div></div></div>'),
                    $text = $('<div class="widget-editable-input"></div>');
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
            };
        }
    };
})(jQuery);