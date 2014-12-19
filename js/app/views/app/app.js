var AppView = (function (Backbone, $, optionsModule, mediator, location) {
    'use strict';
    return Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this, 'render', '_renderAnimateIndicator', '_renderNavBar');
            this.$el = options.$el;
            this.model = options.model;
            this.render();
        },
        events: {
            'click .link-form, .link-profile': 'openForm',
            'click .menu-root': 'openFormFromMenu',
            'click .filter-button': 'filterTreeHandler',
            'click .tab-menu-link': 'openCardTabMenuHandler'

        },
        openCardTabMenuHandler: function (e) {
            //todo: move to card model
            var $this = $(e.target),
                $tabs = $this.closest('.tab-menu').prevAll('.ui-tabs-nav').find('a'),
                menu = [],
                activeClass = chApp.getOptions().classes.activeTab;
            $tabs.each(function () {
                var item = {
                    title: $(this).text(),
                    cmd: $(this).attr('id')
                };
                if ($(this).parent().hasClass(activeClass)) {
                    item.uiIcon = 'ui-icon-check';
                }
                menu.push(item);
            });
            $this.contextmenu({
                show: {effect: "blind", duration: 0},
                menu: menu,
                select: function (event, ui) {
                    $('#' + ui.cmd).trigger('click');
                }
            });
            $this.contextmenu('open', $this);
        },
        filterTreeHandler: function (e) {
            var $this = $(e.target).closest('button'),
                $tree = $this.closest('div').siblings('.widget-tree'),
                nodes = $tree.find('li');
            $this.toggleClass('menu-button-selected');
            var selectedNodes = nodes.filter(function () {
                return $(this).has('.dynatree-selected').length === 0;
            });
            if ($this.hasClass('menu-button-selected')) {
                selectedNodes.hide();
            } else {
                selectedNodes.show();
            }
        },
        openForm: function (e) {
            mediator.publish(optionsModule.getChannel('xmlRequest'), {
                name: $(e.target).attr('href'),
                type: optionsModule.getRequestType('mainForm')
            });
            return false;
        },

        openFormFromMenu: function (e) {
            var $this = $(e.target),
                $subMenu = $this.siblings('.gn-submenu');
            if ($subMenu.length) {
                $subMenu.toggle();
            } else {
                mediator.publish(optionsModule.getChannel('xmlRequest'), {
                    name: $this.attr('href'),
                    type: optionsModule.getRequestType('mainForm')
                });
                $this
                    .closest('.gn-menu-wrapper')
                    .removeClass('gn-open-all')
                    .prev('.gn-icon-menu')
                    .removeClass('gn-selected');
            }
            return false;
        },

        render: function () {
            mediator.publish(
                optionsModule.getChannel('setIdentity'),
                this.model.get('userId'),
                this.model.get('employeeId'),
                this.model.get('userName')
            );
            this._renderAnimateIndicator();
            this._renderNavBar();
            var $downloadAttachmentTmpl = $('<script>', {
                    type: 'text/x-tmpl',
                    id: 'template-download',
                    text: [
                        '{% for (var i=0, file; file=o.files[i]; i++) { %}',
                        '<tr class="template-download fade" data-id="{%=file.id%}">',
                        '<td class="attachment-grid-menu">',
                        '<span class="card-button" data-id = "card-button" title="Открыть карточку"></span>',
                        '</td>',
                        '<td>',
                        '<div class="table-td">',
                        '<a class="attachment-file" data-id="{%=file.filesid%}" title="{%=file.name%}" download="{%=file.name%}">{%=file.name%}</a>',
                        '</div>',
                        '</td>',
                        '<td>',
                        '<div class="table-td">',
                        '<span class="attachment-td">{%=file.version%}</span>',
                        '</div>',
                        '</td>',
                        '<td>',
                        '<div class="table-td">',
                        '<span class="attachment-td">{%=file.insusername%}</span>',
                        '</div>',
                        '</td>',
                        '<td>',
                        '<div class="table-td">',
                        '<span class="attachment-td">{%=file.insdate%}</span>',
                        '</div>',
                        '</td>',
                        '</tr>',
                        '{% } %}'
                    ].join('')
                }),
                $uploadAttachmentTmpl = $('<script>', {
                    type: 'text/x-tmpl',
                    id: 'template-upload',
                    text: [
                        '{% for (var i=0, file; file=o.files[i]; i++) { %}',
                        '<tr class="template-upload fade" >',
                        '<td class="attachment-grid-menu">',
                        '<span class="card-button" data-id = "card-button" title="Открыть карточку"></span>',
                        '</td>',
                        '<td>',
                        '<div class="table-td attachment-new-file">',
                        '<span>{%=file.name%}</span>',
                        '</div>',
                        '</td>',
                        '<td>',
                        '<div class="table-td start">',
                        '<span>1</span>',
                        '<button style="display:none"> </button>',
                        '</div>',
                        '</td>',
                        '<td>',
                        '<div class="table-td">',
                        '</div>',
                        '</td>',
                        '<td>',
                        '<div class="table-td">',
                        '</div>',
                        '</td>',
                        '</tr>',
                        '{% } %}'
                    ].join('')
                });
            this.$el
                .append($downloadAttachmentTmpl)
                .append($uploadAttachmentTmpl);
        },
        _renderAnimateIndicator: function () {
            this.$el.children('header').html(
                [
                    '<div id="fadingBarsG">',
                    '<div id="fadingBarsG_1" class="fadingBarsG">',
                    '</div>',
                    '<div id="fadingBarsG_2" class="fadingBarsG">',
                    '</div>',
                    '<div id="fadingBarsG_3" class="fadingBarsG">',
                    '</div>',
                    '<div id="fadingBarsG_4" class="fadingBarsG">',
                    '</div>',
                    '<div id="fadingBarsG_5" class="fadingBarsG">',
                    '</div>',
                    '<div id="fadingBarsG_6" class="fadingBarsG">',
                    '</div>',
                    '<div id="fadingBarsG_7" class="fadingBarsG">',
                    '</div>',
                    '<div id="fadingBarsG_8" class="fadingBarsG">',
                    '</div>',
                    '</div>'
                ].join('')
            );
        },
        _renderNavBar: function () {

            var host = location.host.toLowerCase(),
                path = location.pathname.toLowerCase(),
                tasksName;
            if (host === optionsModule.getUrl('bp')) {
                tasksName = optionsModule.getConstants('tasksForTopsXml');
            } else {
                tasksName = optionsModule.getConstants('tasksXml');
            }
            if (host !== '10.0.5.2' && path !== optionsModule.getUrl('openFromEmail')) {
                mediator.publish(optionsModule.getChannel('xmlRequest'), {
                    name:tasksName,
                    type: optionsModule.getRequestType('childForm')
                });
            }

            var options = {
                brand: this.model.get('userName'),
                brandUrl: optionsModule.getConstants('userSettingsXml'),
                items: [
                    {
                        label: 'Поручения',
                        url: tasksName,
                        'class': 'link-form'
                    },
                    {
                        label: 'Выйти',
                        url: '/site/logout'
                    }
                ]
            };
            this.$el.children('footer').html(facade.getNavBarModule().create(options));

        }
    })
        ;
})
(Backbone, jQuery, optionsModule, mediator, location);