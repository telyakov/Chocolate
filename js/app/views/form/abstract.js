var AbstractView = (function (Backbone) {
    'use strict';
    return Backbone.View.extend({
        initialize: function (options) {
            _.bindAll(this, 'render');
            this.$el = options.$el;
            this.model = options.model;
            this.view = options.view;
            this.listenTo(this.model, 'refresh:form', function (opts) {
                var isLazy = opts.isLazy;
                if (isLazy) {
                    if (this._refresh_timer_id) {
                        clearTimeout(this._refresh_timer_id);
                    }
                    var _this = this;
                    this._refresh_timer_id = setTimeout(function () {
                        _this.refresh();
                    }, 900);
                } else {
                    this.refresh();
                }
            });
            this.render();


        },
        footerTemplate: _.template([
                '<footer class="grid-footer" data-id="grid-footer">',
                '<div class="footer-info" data-id="info"></div>',
                '<div class="footer-counter"></div>',
                '</footer>'
            ].join('')
        ),
        _formID: null,
        getFormID: function () {
            if (this._formID === null) {
                this._formID = helpersModule.uniqueID();
            }
            return this._formID;
        },
        generateCardID: function(id){
            return [ 'card_', this.model.getView(), id ].join('');
        },
        openCardHandler: function(pk){
                var view = this.model.getView(),
                    $tabs = $('#tabs'),
                    cardID = this.generateCardID(pk),
                    $a = $tabs.find("li[data-tab-id='" + cardID + "']").children('a'),
                    tab;
                if ($a.length === 0) {
                    var viewID = this.getFormID(),
                        caption = this.model.getCardTabCaption();
                    if ($.isNumeric(pk)) {
                        caption += ' [' + pk + ']';
                    } else {
                        caption += '[новая запись]';
                    }
                    var $li = $('<li/>', {
                        'data-tab-id': cardID,
                        'data-id': pk,
                        'data-view': view,
                        'html': facade.getTabsModule().createTabLink('', caption)
                    });
                    facade.getTabsModule().push($li);
                    $tabs.children('ul').append($li);
                    $tabs.tabs("refresh");
                    var _this = this;
                    var cardView =  new CardView({
                        model: _this.model,
                        id: pk
                    });
                    $tabs.tabs({
                        beforeLoad: function (event, ui) {
                            ui.jqXHR.abort();
                            cardView.render(view, pk, viewID, ui.panel);
                        }
                    });

                    $a = $li.children('a');
                    tab = facade.getFactoryModule().makeChTab($a);
                    $tabs.tabs({ active: tab.getIndex()});
                    var href = '#' + tab.getPanelID(),
                        $context = $(href);
                    facade.getRepaintModule().reflowCard($context);
                    cardView.initScripts($context);
                    $a.attr('href', href);
                } else {
                    console.log('elese')
                    tab = facade.getFactoryModule().makeChTab($a);
                    $tabs.tabs({ active: tab.getIndex() });
                }
        },
        _refresh_timer_id: null,
        events: {},
        refresh: function(){
            console.log('refresh');
        },
        showMessage: function(){
          console.log('show message');
        },
        render: function () {
        }
    });
})(Backbone);