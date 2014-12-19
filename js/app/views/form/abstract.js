var AbstractView = (function (Backbone, $, _) {
    'use strict';
    return Backbone.View.extend({
        $el: null,
        model: null,
        view: null,
        formID: null,
        initialize: function (options) {
            _.bindAll(this);
            this.$el = options.$el;
            this.model = options.model;
            this.view = options.view;
            this.formID = facade.getHelpersModule().uniqueID();
            this.listenTo(this.model, 'refresh:form', this.lazyRefresh);
            this.listenTo(this.model, 'save:form', this.save);
            this.render();
        },
        contentExpandHandler: function (e) {
            var $this = $(e.target).closest('button'),
                $expandSection = $this.closest('section');
            $this.toggleClass('menu-button-selected');
            $expandSection.siblings('.section-header, .section-filters').toggleClass('expand-hidden');
            var $expandCardCol = $expandSection.closest('.card-col');
            if ($expandCardCol.length) {
                $expandCardCol.toggleClass('expand-card-visible');
                $expandCardCol.siblings('.card-col').toggleClass('expand-hidden');
            }
            mediator.publish(optionsModule.getChannel('reflowTab'), true);
        },
        _refreshTimerID: null,
        lazyRefresh: function (opts) {
            var isLazy = opts.isLazy;
            if (isLazy) {
                if (this._refreshTimerID) {
                    clearTimeout(this._refreshTimerID);
                }
                var _this = this;
                this._refreshTimerID = setTimeout(function () {
                    _this.refresh();
                }, 900);
            } else {
                this.refresh();
            }
        },
        getFormID: function () {
            return this.formID;
        },
        _chForm: null,
        getChForm: function () {
            //todo: for support legacy code
            if (this._chForm === null) {
                this._chForm = facade.getFactoryModule().makeChGridForm($('#' + this.getFormID()));
            }
            return this._chForm;
        },
        footerTemplate: _.template([
                '<footer class="grid-footer" data-id="grid-footer">',
                '<div class="footer-info" data-id="info"></div>',
                '<div class="footer-counter"></div>',
                '</footer>'
            ].join('')
        ),
        generateCardID: function (id) {
            return ['card_', this.model.getView(), id].join('');
        },
        getCardCaption: function (pk) {
            var caption = this.model.getCardTabCaption();
            if ($.isNumeric(pk)) {
                caption += ' [' + pk + ']';
            } else {
                caption += '[новая запись]';
            }
            return caption;
        },
        openCardHandler: function (pk) {
            var view = this.model.getView(),
                $tabs = $('#tabs'),
                cardID = this.generateCardID(pk),
                $a = $tabs.find("li[data-tab-id='" + cardID + "']").children('a'),
                tab;
            if ($a.length) {
                tab = facade.getFactoryModule().makeChTab($a);
                $tabs.tabs({active: tab.getIndex()});
            } else {
                var viewID = this.getFormID(),
                    caption = this.getCardCaption(pk),
                    $li = $('<li>', {
                        'data-tab-id': cardID,
                        'data-id': pk,
                        'data-view': view,
                        'html': facade.getTabsModule().createTabLink('', caption)
                    });
                facade.getTabsModule().push($li);
                $tabs.children('ul').append($li);
                $tabs.tabs('refresh');
                var cardView = new CardView({
                    model: this.model,
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
                $tabs.tabs({active: tab.getIndex()});
                var href = '#' + tab.getPanelID(),
                    $context = $(href);
                facade.getRepaintModule().reflowCard($context);
                cardView.initScripts($context);
                $a.attr('href', href);
            }
        },
        save: function(data){
            console.log('not implemented save method');
        },
        refresh: function () {
            console.log('not implemented refresh method');
        },
        showMessage: function () {
            console.log('not implemented showMessage method');
        },
        render: function () {
            console.log('not implemented render method');
        }
    });
})(Backbone, jQuery, _);