var taskWizard = (function ($) {
    'use strict';
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
        makeOnDone: function () {
            return function ($cnt, commandObj) {
                var form = commandObj.form,
                    data = $.extend({}, form.getDefaultObj());
                data.usersidlist = commandObj.usersidlist;
                data.description = commandObj.description;
                data.users = commandObj.userNames;
                data.serviceid = commandObj.serviceID;
                form.addRow(data);
            };
        },
        makeServiceCommand: function () {
            return function($cnt, commandObj)
            {
                var _this = $cnt;
                jQuery.get(
                    MajesticVars.EXECUTE_URL,
                    {cache: true, sql: 'Tasks.ServicesGet'},
                    function (response) {
                        var ch_response = new ChResponse(response);
                        if (ch_response.isSuccess()) {
                            var nodes = ch_response.getData(),
                                map = {}, node, roots = [], autocomplete_data = [];
                            for (var i in nodes) {
                                node = nodes[i];
                                node.title = node.name;
                                node.key = i;
                                node.icon = false;
                                node.children = [];
                                map[node.id] = i; // use map to look-up the parents
                                if (node.parentid !== null) {
                                    autocomplete_data.push({label: node.title, id: node.key})
                                    nodes[map[node.parentid]].children.push(node);
                                } else {

                                    roots.push(node);
                                }
                            }
                            var $content = $('<div></div>');
                            var $tree = $('<div class="widget-tree"></div>');
                            $tree.dynatree({
                                children: roots,
                                selectMode: 1,
                                onQueryActivate: function (flag, node) {
                                    if (node.data.children.length == 0) {
                                        return true;
                                    } else {
                                        return false
                                    }
                                },
                                onRender: function (node, nodeSpan) {
                                    if (node.data.children.length == 0) {

                                        $(nodeSpan).attr("data-id", node.data.id);
                                        $(nodeSpan).attr("data-title", node.data.title.toLowerCase());
                                    }
                                },
                                onActivate: function (node) {
                                    var desc = node.data.description,
                                        useridlist = node.data.usersidlist;
                                    mjWizard.serviceid = node.data.id;
                                    mjWizard.description = desc;
                                    mjWizard.usersidlist = useridlist;
                                    var $span = $(node.span),
                                        $nxt_btn = $span.closest('div.ui-widget').find('button.wizard-next-button.wizard-no-active');
                                    $nxt_btn.removeClass('wizard-no-active').addClass('wizard-active');
                                }
                            });
                            $tree.dynatree("getRoot").visit(function (node) {
                                node.expand(true);
                            });
                            var $search = $('<input type="text">');
                            var $header = $('<div class="widget-header-tree"></div>')

                            $header.append($search);
                            $content.prepend($header)
                            $content.append($tree)

                            openWizardDialog($content, mjWizard, _this, false, 'Выберите тип поручения '+mjWizard.getStepCaption());
                            $search.autocomplete({
                                delay: 100,
                                source: function (request, response) {
                                    var search = Chocolate.eng2rus(request.term.toLowerCase())
                                    $content.find('.node-searched').removeClass('node-searched')
                                    $content.find('[data-title*=\'' + search + '\']').addClass('node-searched')
                                    response(autocomplete_data.filter(chFunctions.filterSearchData(search, 'label')))
                                },
                                close: function (event, ui) {
                                    $content.find('.node-searched').removeClass('node-searched')

                                },
                                select: function (event, ui) {

                                    var id = ui.item.id;
                                    var $elem = $content.find('[data-id=' + id + ']')
                                    $content.find('.node-searched').removeClass('node-searched')
                                    $tree.dynatree("getTree").activateKey(id)

                                }
                            })
                        }
                        else {
                            alert("Произошла ошибка при открытии мастера поручений. Обратитесь к разработчикам.")
                        }
                    }
                ).
                    fail(function () {
                        alert("Произошла ошибка при открытии мастера поручений. Обратитесь к разработчикам.")
                    });
            };
        },
        makeExecutorsCommand: function () {

        },
        makeDescriptionCommand: function () {

        }
    };
})(jQuery);