var AppView = (function (Backbone, $, optionsModule, mediator, location, window, helpersModule) {
    'use strict';
    return Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this, 'render', '_renderAnimateIndicator', '_renderNavBar');
            this.$el = $('body');
            this.model = options.model;
        },
        events: {
            'click .link-form, .link-profile': 'openForm',
            'click .menu-root': 'openFormFromMenu',
            'click .filter-button': 'filterTreeHandler',
            'click .widget-elem-close': 'deselectTreeElementHandler',
            'keydown': 'preventDefaultBrowserEvents',
            'click .fm-phone': 'makeCallHandler',
            'click .section-filters div > label': 'disableFilter',
            'click .filter-mock-no-edit': 'enableFilter',
            'keydown textarea': 'addSignToText',
            'click #tabs>ul>li': 'tabHistoryLog',
            'mouseup .ui-tabs-anchor[href=1]': 'reflowTab',
            'click .ui-tabs-anchor[href^=#]': 'reflowTab'
        },
        reflowTab: function () {
            mediator.publish(facade.getOptionsModule().getChannel('reflowTab'));
        },
        tabHistoryLog: function (e) {
            facade.getTabsModule().push($(e.target).closest('li'));
        },
        addSignToText: function (e) {
            if (e.keyCode === optionsModule.getKeyCode('f4')) {
                var userModule = facade.getUserModule();
                $(e.target).insertAtCaret(userModule.getSign());
                return false;
            }
            return true;
        },
        enableFilter: function (e) {
            var $this = $(e.target),
                $controls = $this.parent().find('select, input');
            $controls.prop('disabled', false);
            $controls
                .filter('input')
                .eq(0)
                .focus();
            $this.remove();

            return false;
        },
        disableFilter: function (e) {
            var $this = $(e.target);
            $this.siblings('select, input').prop('disabled', true);
            $this.closest('.filter-item').prepend('<div class="filter-mock-no-edit"></div>');
        },
        makeCallHandler: function (e) {
            var phoneTo = $(e.target).attr('data-phone');
            facade.getPhoneModule().makeCall(phoneTo);
        },
        preventDefaultBrowserEvents: function (e) {
            var isNotTextEditMode = (['INPUT', 'TEXTAREA'].indexOf(e.target.tagName) === -1);
            if (isNotTextEditMode) {
                if (e.keyCode === optionsModule.getKeyCode('backspace')) {
                    e.preventDefault();
                }
                if (e.keyCode === optionsModule.getKeyCode('escape') && e.target.tagName === 'BODY') {
                    //todo: вернуть код
                    //var tab = facade.getTabsModule().getActiveChTab();
                    //if (tab.isCardTypePanel()) {
                    //    var card = facade.getFactoryModule().makeChCard(tab.getPanel().children('[data-id=grid-tabs]'));
                    //    if (!card._isChanged() && $(e.target).children('.fancybox-overlay').length === 0) {
                    //        facade.getTabsModule().closeActiveTab();
                    //    }
                    //}
                }
            }
        },
        deselectTreeElementHandler: function (e) {
            var $panelElem = $(e.target).closest('.widget-panel-elm'),
                key = $panelElem.attr('data-key'),
                tree = $panelElem
                    .closest('.widget-panel')
                    .prev('.widget-tree-compact')
                    .dynatree("getTree");
            tree.selectKey(key, false);
            $panelElem.remove();
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
        createGlobalEvents: function () {
            $(window)
                .on('beforeunload', this.warningMessageHandler)
                .on('resize', $.debounce(300, false, this.reflowWindow));

        },
        reflowWindow: function () {
            facade.getRepaintModule().clearCache();
            mediator.publish(optionsModule.getChannel('reflowTab'));
        },
        warningMessageHandler: function () {
            if (helpersModule.appHasChange()) {
                return optionsModule.getMessage('chocolateHasChange');
            }
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
                        '<tr class="template-download fade in" data-id="{%=file.id%}">',
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
            this.createGlobalEvents();
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
            var isOpenFromEmail = (path === optionsModule.getUrl('openFromEmail'))
            if (host !== '10.0.5.2' && !isOpenFromEmail) {
                //todo: сделать поддержку настройки автозапуска форм
                setTimeout(function () {
                    mediator.publish(optionsModule.getChannel('xmlRequest'), {
                        name: tasksName,
                        type: optionsModule.getRequestType('mainForm')
                    });
                }, 300);
            }
            if (isOpenFromEmail) {
                var rawParams = location.search.split('&'),
                    params = {};
                rawParams.forEach(function (par) {
                    var tokens = par.split('='),
                        name = tokens[0],
                        value = tokens[1];
                    if (name.indexOf('?') === 0) {
                        name = name.substr(1);
                    }
                    params[name] = value;
                });
                var view = params.view,
                    idList = params.id;
                setTimeout(function () {
                    var defer = deferredModule.create(),
                        deferId = deferredModule.save(defer);
                    mediator.publish(optionsModule.getChannel('xmlRequest'), {
                        name: view,
                        type: optionsModule.getRequestType('deferred'),
                        id: deferId
                    });
                    defer.done(function (res) {
                        var $xml = res.data,
                            model = new FormModel({
                                $xml: $xml
                            }),
                            view =  new FormView({
                                model: model
                            }),
                            filterModel = model.getFiltersROCollection(view).findWhere({key: 'idlist'});
                        if (filterModel) {
                            filterModel.set('value', idList);
                        }

                        view.render();
                    })
                }, 300);
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
(Backbone, jQuery, optionsModule, mediator, location, window, helpersModule);