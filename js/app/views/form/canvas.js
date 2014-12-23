var CanvasView = (function (Backbone) {
    'use strict';
    return AbstractView.extend({
        template: _.template([
            '<form data-id="<%= view %>" id="<%= id%>" ',
            'data-card-support="<%= isCardSupport %>"',
            '>',
            '</form>'
        ].join('')),
        _canvasID: null,
        getCanvasID: function () {
            if (this._canvasID === null) {
                this._canvasID = helpersModule.uniqueID();
            }
            return this._canvasID;
        },
        render: function () {
            var formID = this.getFormID(),
                $form = $(this.template({
                    id: formID,
                    view: this.model.getView(),
                    isCardSupport: this.model.hasCard()
                }));
            this.$el.html($form);
            var menuView = new MenuView({
                view: this,
                $el: $form
            });
            var $sectionCanvas = $('<section>', {
                'data-id': 'canvas',
                'class': 'canvas'
            });
            var $map = $('<canvas>', {
                'class': 'chocolate-canvas',
                id: this.getCanvasID()
            });
            $sectionCanvas.html($map);
            $form.append($sectionCanvas);
        },
        initData: function(){

            var $canvas = $('#' + this.getCanvasID()),
                canvas = facade.getFactoryModule().makeChCanvas($canvas),
                model = this.model,
                _this = this,
                data = this.view.getFilterData();
            var defer = model.deferReadProc(data);
            defer.done(function (res) {
                var sql = res.sql;
                var deferRead = deferredModule.create(),
                    deferReadID = deferredModule.save(deferRead);
                mediator.publish(optionsModule.getChannel('socketRequest'), {
                    query: sql,
                    type: optionsModule.getRequestType('chFormRefresh'),
                    id: deferReadID
                });
                deferRead.done(function (res) {
                    var data = res.data;
                    this.persistData(data, res.order);
                    var options = new ChCanvasOptions();
                    canvas.refreshData(data, options, _this);
                });
            });

            //_this.updateStorage(data, {});
            //var options = new ChCanvasOptions();
            //ch_canvas.refreshData(data, options);

            //var url = this.getRefreshUrl(),
            //    parentView = parentView? parentView :this.getParentView(),
            //    searchData = this.getSearchData(),
            //    chMessagesContainer = this.getMessagesContainer(),
            //    _this = this;
            //console.log(parentView, searchData)
            //$.ajax({
            //    url: url + '&ParentView=' + parentView,
            //    type: "POST",
            //    data: searchData,
            //    success: function (response, st, xhr) {
            //        var chResponse = new ChSearchResponse(response);
            //        var type = _this.getType();
            //        if (chResponse.isSuccess()) {
            //            if (type == 'map') {
            //                var $map = _this.$form.children('section').children('.map');
            //                var ch_map = facade.getFactoryModule().makeChMap($map);
            //                ch_map.refreshPoints(chResponse.getData(), chMessagesContainer);
            //
            //            } else if (type == 'canvas') {
            //                var $canvas = _this.$form.find('canvas');
            //                var ch_canvas = facade.getFactoryModule().makeChCanvas($canvas);
            //                var data = chResponse.getData();
            //                _this.updateStorage(data, {});
            //                var options = new ChCanvasOptions();
            //                ch_canvas.refreshData(data, options);
            //            }
            //            else {
            //                _this.updateData(chResponse.getData(), chResponse.getOrder());
            //                _this._clearDeletedObj();
            //                _this._clearChangedObj();
            //                _this.clearSelectedArea();
            //
            //            }
            //            var filterForm = _this.getFilterForm();
            //            if (filterForm && typeof filterForm != 'undefined' && filterForm.$form.length) {
            //
            //                var filters = filterForm.getAutoRefreshFiltersCol();
            //                if (filters.length) {
            //                    //todo: сделать один общий ajax
            //                    filters.forEach(
            //                        /**
            //                         * @param chFilter {ChFilter}
            //                         */
            //                            function (chFilter) {
            //                            $.get('/majestic/filterLayout', {'name': chFilter.getKey(), view: _this.getView(), 'parentID': _this.getParentPK()}).done(function (response, st, xhr) {
            //                                var $filter = $('<li>' + response + '</li>');
            //                                var selValues = chFilter.getNamesSelectedValues();
            //                                chFilter.$elem.html($filter.html());
            //                                selValues.forEach(function (value) {
            //                                    chFilter.$elem.find('[value="' + value + '"]').prop("checked", true);
            //                                })
            //                                delete xhr.responseText;
            //                                delete xhr;
            //                                delete response;
            //
            //                            }).fail(function () {
            //                                console.log('error')
            //                            })
            //                        })
            //                }
            //
            //            }
            //        }
            //        chResponse.destroy();
            //        delete chResponse;
            //        delete response;
            //        delete xhr.responseText;
            //        delete xhr;
            //        facade.getFactoryModule().garbageCollection();
            //
            //    },
            //    error: function (xhr, st, er) {
            //        chMessagesContainer.sendMessage(er, ChResponseStatus.ERROR)
            //    }
            //})


        },
        refresh: function () {
            this.initData();
        }
    });
})(Backbone);