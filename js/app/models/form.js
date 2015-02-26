/**
 * @class FormModel
 * @augments Backbone.Model
 */
var FormModel = (function () {
    'use strict';
    return Backbone.Model.extend(
        /** @lends FormModel */
        {
            defaults: {
                $xml: null,
                write: false,
                parentModel: null,
                parentId: null,
                columnName: null
            },
            _columnsCollection: null,
            _allColumnsRoCollection: null,
            _dataFormProperties: null,
            _agileFilters: null,
            _actionProperties: null,
            _cardCollection: null,
            _cardROCollection: null,
            _filterRoCollection: null,
            _printActions: null,
            _columnsRoCollection: null,
            _dynamicDefaultValues: {},
            _columnsCardRoCollection: null,
            _preview: null,
            _requiredFields: null,
            _openedCards: [],
            _openedForms: {},
            /**
             * @public
             * @desc destroy
             */
            destroy: function () {
                if (this._columnsCollection) {
                    this._columnsCollection.each(
                        /** @param {ColumnProperties} object */
                            function (object) {
                            object.destroy();
                        });
                    delete this._columnsCollection;
                }

                if (this._allColumnsRoCollection) {
                    this._allColumnsRoCollection.each(
                        /** @param {ColumnProperties} object */
                            function (object) {
                            object.destroy();
                        });
                    delete this._allColumnsRoCollection;
                }

                if (this._cardROCollection) {
                    this._cardROCollection.each(
                        /** @param {CardRO} model */
                            function (model) {
                            model.destroy();
                        });
                    delete this._cardROCollection;
                }


                if (this._dataFormProperties) {
                    this._dataFormProperties.destroy();
                    delete this._dataFormProperties;
                }
                if (this._agileFilters) {
                    this._agileFilters.destroy();
                    delete this._agileFilters;
                }
                if (this._actionProperties) {
                    this._actionProperties.destroy();
                    delete this._actionProperties;
                }
                if (this._filterRoCollection) {
                    this._filterRoCollection.each(
                        /** @param {FilterRO} object */
                            function (object) {
                            object.destroy();
                        });
                    delete this._filterRoCollection;
                }
                delete this._printActions;
                if (this._columnsRoCollection) {
                    this._columnsRoCollection.each(
                        /** @param {ColumnRO} object */
                            function (object) {
                            object.destroy();
                        });
                    delete this._columnsRoCollection;
                }
                delete this._dynamicDefaultValues;
                if (this._columnsCardRoCollection) {
                    this._columnsCardRoCollection.each(
                        /** @param {CardRO} object */
                            function (object) {
                            object.destroy();
                        });
                    delete this._columnsCardRoCollection;
                }

                if (this._cardCollection) {
                    this._cardCollection.each(function (object) {
                        object.destroy();
                    });
                    delete this._cardCollection;
                }
                delete this._preview;
                delete this._requiredFields;
                this.set('$xml', null);

                this.set('write', null);

                /**
                 * @type {FormModel|null}
                 */
                var parentModel = this.get('parentModel');
                if (parentModel) {
                    var formKey = this.get('columnName') + '_' + this.get('parentId');
                    parentModel.deleteOpenedForm(formKey);
                    this.set('parentModel', null);
                }

                this.set('parentId', null);
                this.set('columnName', null);
                for (var i in this._openedForms) {
                    if (this._openedForms.hasOwnProperty(i)) {
                        this._openedForms[i].destroy();
                    }
                }
                delete this._openedForms;

                this._openedCards.forEach(function (model) {
                    model.destroy();
                });
                delete this._openedCards;
                storageModule.removeFromSession(this.cid);
            },
            /**
             * @desc get access to write if form
             * @returns {Boolean}
             */
            isAllowWrite: function () {
                var parentModel = this.get('parentModel');
                if (parentModel) {
                    return parentModel.isAllowWrite();
                }
                return this.get('write');
            },

            /**
             *
             * @returns {*}
             * @private
             */
            _getDynamicDefaultValues: function () {
                return this._dynamicDefaultValues;
            },
            /**
             *
             * @param {string} key
             * @param {string} val
             */
            setDynamicDefaultValue: function (key, val) {
                this._dynamicDefaultValues[key] = val;
            },
            /**
             *
             * @returns {ColumnsROCollection}
             * @private
             */
            _getRequiredFields: function () {
                if (this._requiredFields === null) {
                    var requiredFields = [];
                    this.getColumnsROCollection().each(
                        /** @param {ColumnRO} model */
                            function (model) {
                            if (model.isRequired()) {
                                requiredFields.push(model.get('key'));
                            }
                        });
                    this._requiredFields = requiredFields;
                }
                return this._requiredFields;
            },
            /**
             * @desc return columnROCollection without visible property
             * @returns {ColumnsROCollection}
             */
            _getAllColumnsROCollection: function () {
                if (this._allColumnsRoCollection === null) {
                    var columnsCollection = this._getColumnsCollection(),
                        columnsROCollection = new ColumnsROCollection();

                    columnsCollection.each(
                        /** @param {ColumnProperties} model */
                            function (model) {
                            var columnRO = ColumnsRoFactory.make(model);
                            columnsROCollection.push(columnRO);
                        });
                    this._allColumnsRoCollection = columnsROCollection;
                    if (this.isAttachmentSupport()) {
                        columnsROCollection.push(new AttachmentColumnRO());
                    }
                }
                return this._allColumnsRoCollection;
            },
            /**
             * @public
             * @returns {Object}
             */
            getColumnsDefaultValues: function () {
                var staticDefaultValues = {};
                this._getAllColumnsROCollection().each(
                    /** @param {ColumnRO} model */
                        function (model) {
                        var defaultValue = model.getDefault();
                        if (defaultValue) {
                            staticDefaultValues[model.getFromKey()] = defaultValue;
                        }
                    });
                return $.extend({}, staticDefaultValues, this._getDynamicDefaultValues());
            },
            /**
             * @public
             * @returns {Boolean}
             */
            hasCardHeader: function () {
                return this.getCardHeaderText() || this.getCardHeaderImage();
            },
            /**
             * @public
             * @returns {String}
             */
            getCardHeaderImage: function () {
                return this._getCardCollection().getHeaderImage();
            },
            /**
             * @public
             * @returns {String}
             */
            getCardHeaderText: function () {
                return this._getCardCollection().getHeader();
            },
            /**
             *
             * @public
             * @returns {Array}
             */
            getPrintActions: function () {
                if (this._printActions === null) {

                    var _this = this,
                        printActions = new PrintActions({
                            printActionsXml: _this._getDataFormProperties().getPrintActionsXml()
                        });
                    this._printActions = printActions.getActions();
                }
                return this._printActions;
            },
            /**
             * @public
             * @returns {boolean}
             */
            isAllowAudit: function () {
                return interpreterModule.parseBooleanExpression(
                    this._getDataFormProperties().getAllowAuditButton(), false
                );
            },
            /**
             * @public
             * @returns {boolean}
             */
            isSearchColumnVisible: function () {
                return this._getColumnsCollection().length > 10 && !this.isCanvasView() && !this.isMapView();
            },
            /**
             *
             * @returns {String}
             * @private
             */
            _getCreateEmptyProc: function () {
                return this._getDataFormProperties().getCreateEmptyProc();
            },
            /**
             * @public
             * @returns {Deferred}
             */
            runAsyncTaskCreateEmptyDefaultValues: function () {
                var asyncTask = deferredModule.create();
                bindModule.runAsyncTaskBindSql(this._getCreateEmptyProc())
                    .done(
                    /** @param {SqlBindingResponse} res */
                        function (res) {
                        mediator.publish(optionsModule.getChannel('socketRequest'), {
                            query: res.sql,
                            type: optionsModule.getRequestType('deferred'),
                            id: deferredModule.save(asyncTask)
                        });
                    });
                return asyncTask;
            },
            /**
             *
             * @returns {String}
             * @private
             */
            _getCreateProc: function () {
                return this._getDataFormProperties().getCreateProc();
            },
            /**
             *
             * @returns {String}
             * @private
             */
            _getDeleteProc: function () {
                return this._getDataFormProperties().getDeleteProc();
            },
            /**
             *
             * @returns {String}
             * @private
             */
            _getUpdateProc: function () {
                var sql = this._getDataFormProperties().getValidationProc();
                if (!sql) {
                    sql = this._getDataFormProperties().getUpdateProc();
                }
                return sql;
            },
            /**
             *
             * @param {Object} data
             * @returns {Object}
             * @private
             */
            _getDataToBind: function (data) {
                return $.extend({}, this.getParamsForBind(), data);
            },
            /**
             * @public
             * @param {Object} data
             * @returns {Deferred}
             */
            runAsyncTaskBindInsProc: function (data) {
                var extendedData = this._getDataToBind(data),
                    sql = this._getCreateProc();
                return bindModule.runAsyncTaskBindSql(sql, extendedData, true);
            },
            /**
             *
             * @param {Object} data
             * @returns {Deferred}
             * @private
             */
            _runAsyncTaskBindUpdateProc: function (data) {
                var extendedData = this._getDataToBind(data),
                    sql = this._getUpdateProc();
                return bindModule.runAsyncTaskBindSql(sql, extendedData, true);
            },
            /**
             *
             * @param {Object} data
             * @returns {Deferred}
             * @private
             */
            _runAsyncTaskDeleteProc: function (data) {
                var extendedData = this._getDataToBind(data),
                    sql = this._getDeleteProc();
                return bindModule.runAsyncTaskBindSql(sql, extendedData, true);
            },
            /**
             * @public
             * @param {Object} changedData
             * @param {Object} [deletedData]
             * @returns {Deferred}
             */
            runAsyncTaskSave: function (changedData, deletedData) {
                var asyncTasks = [],
                    mainTask = deferredModule.create(),
                    i,
                    sqlList = [],
                    hasOwn = Object.prototype.hasOwnProperty,
                    task,
                    currentData,
                    extendedData;

                if (changedData) {
                    for (i in changedData) {
                        if (hasOwn.call(changedData, i)) {
                            currentData = changedData[i];
                            extendedData = this._getDataToBind(currentData);
                            if (helpersModule.isNewRow(currentData.id)) {
                                task = this.runAsyncTaskBindInsProc(extendedData);
                            } else {
                                task = this._runAsyncTaskBindUpdateProc(extendedData);
                            }
                            asyncTasks.push(task);
                            task
                                .done(
                                /** @param {SqlBindingResponse} res */
                                    function (res) {
                                    sqlList.push(res.sql);
                                })
                                .fail(function (error) {
                                    mediator.publish(optionsModule.getChannel('logError'), error);
                                });
                        }
                    }
                }

                if (deletedData) {
                    var deletedID;
                    for (deletedID in deletedData) {
                        if (hasOwn.call(deletedData, deletedID)) {
                            extendedData = this._getDataToBind({id: deletedID});
                            task = this._runAsyncTaskDeleteProc(extendedData);
                            asyncTasks.push(task);
                            task
                                .done(
                                /** @param {SqlBindingResponse} res */
                                    function (res) {
                                    sqlList.push(res.sql);
                                })
                                .fail(function (error) {
                                    mediator.publish(optionsModule.getChannel('logError'), error);
                                });
                        }
                    }
                }
                $.when.apply($, asyncTasks)
                    .done(function () {
                        mediator.publish(optionsModule.getChannel('socketMultiplyExec'), {
                            sqlList: sqlList,
                            type: optionsModule.getRequestType('deferred'),
                            id: deferredModule.save(mainTask)
                        });
                    })
                    .fail(function (error) {
                        mainTask.reject(error);
                    });
                return mainTask;
            },
            /**
             * @public
             * @param {string} sql
             * @returns {Deferred}
             */
            runAsyncTaskGetData: function (sql) {
                var asyncTask = deferredModule.create();
                mediator.publish(optionsModule.getChannel('socketRequest'), {
                    query: sql,
                    type: optionsModule.getRequestType('chFormRefresh'),
                    id: deferredModule.save(asyncTask)
                });
                return asyncTask;
            },
            /**
             * @public
             * @returns {boolean}
             */
            isSupportCreateEmpty: function () {
                return this._getCreateEmptyProc() ? true : false;
            },
            /**
             * @public
             * @returns {boolean}
             */
            isAutoOpenCard: function () {
                return interpreterModule.parseBooleanExpression(
                    this._getCardCollection().getAutoOpen(), false
                );
            },
            /**
             * @public
             * @returns {boolean}
             */
            isAllowCreate: function () {
                return this.isAllowWrite() && interpreterModule.parseBooleanExpression(this._getDataFormProperties().getAllowAddNew(), false);
            },
            /**
             * @public
             * @returns {boolean}
             */
            isAllowSave: function () {
                return this.isAllowWrite() && interpreterModule.parseBooleanExpression(this._getDataFormProperties().getSaveButtonVisible(), false);
            },
            /**
             * @public
             * @returns {boolean}
             */
            isAllowRefresh: function () {
                return interpreterModule.parseBooleanExpression(this._getDataFormProperties().getRefreshButtonVisible(), false) && this.isAllowInitRefresh();
            },
            /**
             *
             * @public
             * @returns {boolean}
             */
            isAllowPrintActions: function () {
                return this.getPrintActions().length > 0;
            },
            /**
             * @public
             * @returns {String}
             */
            getKey: function () {
                return this._getDataFormProperties().getKey();
            },
            /**
             * @returns {string}
             */
            getView: function () {
                return this.getKey() + '.xml';
            },
            /**
             * @public
             * @returns {boolean}
             */
            isCanvasView: function () {
                return this.getKey() === 'sales\\flatsgramm';
            },
            /**
             * @public
             * @returns {boolean}
             */
            isMapView: function () {
                return this.getKey() === 'crm\\map';
            },
            /**
             * @public
             * @returns {boolean}
             */
            isAttachmentView: function () {
                return this.getKey() === 'attachmentstasks';
            },
            /**
             * @public
             * @returns {boolean}
             */
            isDiscussionView: function () {
                return this.getKey() === 'directory\\discussions';
            },
            /**
             * @public
             * @returns {boolean}
             */
            isAllowInitRefresh: function(){
                var parentID = this.get('parentId');
                return!parentID || !helpersModule.isNewRow(parentID);
            },
            /**
             * @public
             * @returns {boolean}
             */
            parentModelIsNotSaved: function () {
                return helpersModule.isNewRow(this.get('parentId'));
            },
            /**
             * @returns {String}
             * @private
             */
            _getFormViewClassName: function () {
                switch (true) {
                    case this.isMapView():
                        return MapView;
                    case this.isCanvasView():
                        return CanvasView;
                    case this.isAttachmentView():
                        return AttachmentView;
                    case this.isDiscussionView():
                        return DiscussionView;
                    default :
                        return GridView;
                }
            },
            /**
             * @public
             * @desc Create instance of AbstractView
             * @param {jQuery} $el
             * @param {FormView} view
             * @returns {AbstractView}
             */
            makeView: function ($el, view) {
                var ViewClass = this._getFormViewClassName();
                return new ViewClass({
                    $el: $el,
                    model: this,
                    view: view
                });
            },
            /**
             *
             * @returns {?jQuery}
             * @private
             */
            _getXml: function () {
                return this.get('$xml')
            },
            /**
             *
             * @returns {ColumnsPropertiesCollection}
             * @private
             */
            _getColumnsCollection: function () {
                if (this._columnsCollection === null) {
                    var columns = [],
                        $xml = this._getXml();
                    if ($xml) {
                        var $gridLayout = $xml.find('GridLayoutXml'),
                            $columns = $($.parseXML($.trim($gridLayout.text()))),
                            $gridProperties = $columns.find('GridProperties');
                        $columns.find('Column').each(function () {
                            columns.push(new ColumnProperties({
                                    $obj: $(this)
                                }
                            ));
                        });
                        this._columnsCollection = new ColumnsPropertiesCollection(columns, {
                            $obj: $gridProperties
                        });

                    }
                }
                return this._columnsCollection;
            },
            /**
             *
             * @returns {DataFormProperties}
             * @private
             */
            _getDataFormProperties: function () {
                if (this._dataFormProperties === null) {
                    var $xml = this._getXml();
                    if ($xml) {
                        this._dataFormProperties = new DataFormProperties({
                            $obj: $xml.find('DataFormProperties')
                        });
                    }
                }


                return this._dataFormProperties;
            },
            /**
             *
             * @returns {AgileFiltersCollections}
             * @private
             */
            _getFiltersCollections: function () {
                if (this._agileFilters === null) {
                    var filters = [],
                        $xml = this.get('$xml');
                    if ($xml) {
                        var $filtersPanel = $xml.find('FiltersPanelXml'),
                            $filters = $($.parseXML($.trim($filtersPanel.text()))),
                            $agileFilters = $filters.find('AgileFilters');

                        $agileFilters.find('AgileFilter').each(function () {
                            filters.push(new AgileFilter({
                                    $obj: $(this)
                                }
                            ));
                        });
                        this._agileFilters = new AgileFiltersCollections(filters, {
                            $obj: $agileFilters
                        });
                    }
                }

                return this._agileFilters;

            },
            /**
             * @public
             * @returns {ActionsPropertiesCollection}
             */
            getActionProperties: function () {
                if (this._actionProperties === null) {
                    var actions = [],
                        $xml = this.get('$xml');
                    if ($xml) {
                        var $actions = $xml.find('ActionsXml');
                        $actions = $($.parseXML($.trim($actions.text())));

                        $actions.find('MenuAction').each(function () {
                            actions.push(new ActionProperties({
                                    $obj: $(this)
                                }
                            ));
                        });
                        this._actionProperties = new ActionsPropertiesCollection(actions);
                    }
                }

                return this._actionProperties;
            },
            /**
             * @public
             * @returns {boolean}
             */
            hasCard: function () {
                return this._getCardCollection().length > 0;
            },
            /**
             *
             * @returns {CardCollections}
             * @private
             */
            _getCardCollection: function () {
                if (this._cardCollection === null) {
                    var cards = [],
                        $xml = this.get('$xml');
                    if ($xml) {
                        var $cards = $xml.find('Cards');
                        $cards = $($.parseXML($.trim($cards.text())));

                        $cards.find('Card').each(function () {
                            cards.push(new Card({
                                    $obj: $(this)
                                }
                            ));
                        });
                        this._cardCollection = new CardCollections(cards, {
                            $obj: $cards.children('Cards').children('Style')
                        });
                    }
                }

                return this._cardCollection;
            },
            /**
             * @public
             * @returns {CardROCollection}
             */
            getCardROCollection: function () {
                if (this._cardROCollection === null) {
                    var collection = new CardROCollection();

                    this._getCardCollection().each(function (card) {
                        var cardRO = new CardRO({
                            card: card,
                            key: card.getKey()
                        });
                        if (cardRO.isVisible()) {
                            collection.push(cardRO);
                        }
                    });
                    this._cardROCollection = collection;
                }

                return this._cardROCollection;
            },
            /**
             *
             * @param {CardRO} card
             * @param {CardView} view
             * @returns {Array}
             */
            getCardElements: function (card, view) {
                //todo: remove view dependencies
                var key = card.getKey(),
                    cardElements = [],
                    collection = this._getColumnsCardROCollection(),
                    _this = this;
                collection.each(
                    /** @param {ColumnRO} model */
                        function (model) {
                        if (model.getCardKey() === key) {
                            var elem = CardElementFactory.make(model, collection, _this, view);
                            cardElements.push(elem);
                        }
                    });
                return cardElements;
            },
            /**
             * @public
             * @returns {String}
             */
            getCardTabCaption: function () {
                return this._getCardCollection().getCaption();
            },
            /**
             * @public
             * @returns {String}
             */
            getCaption: function () {
                return this._getDataFormProperties().getWindowCaption();
            },
            /**
             * @public
             * @returns {Boolean}
             */
            hasHeader: function () {
                var header = this.getHeaderText() || this.getImage() || this.getStateProc();
                return header !== '';
            },
            /**
             * @public
             * @returns {String}
             */
            getImage: function () {
                return this._getDataFormProperties().getHeaderImage();
            },
            /**
             *
             * @public
             * @returns {String}
             */
            getHeaderText: function () {
                return this._getDataFormProperties().getHeaderText();
            },
            /**
             *
             * @public
             * @returns {String}
             */
            getStateProc: function () {
                return this._getDataFormProperties().getStateProc();
            },
            /**
             * @public
             * @returns {boolean}
             */
            hasFilters: function () {
                return this._getFiltersCollections().length !== 0 && !this.isDiscussionView();
            },
            /**
             * @public
             * @param {FormView} [view]
             * @param {jQuery} [$filterSection]
             * @returns {FiltersROCollection}
             */
            getFiltersROCollection: function (view, $filterSection) {
                if (this._filterRoCollection === null) {
                    var filtersCollection = this._getFiltersCollections(),
                        filtersROCollection = new FiltersROCollection();

                    filtersCollection.each(
                        /** @param {FilterProperties} model */
                            function (model) {
                            filtersROCollection.push(FilterRoFactory.make(model, view, $filterSection));
                        });
                    this._filterRoCollection = filtersROCollection;
                }

                return this._filterRoCollection;
            },
            /**
             * @public
             * @returns {ColumnsROCollection}
             */
            getColumnsROCollection: function () {
                if (this._columnsRoCollection === null) {
                    var columnsCollection = this._getColumnsCollection(),
                        columnsROCollection = new ColumnsROCollection();

                    columnsCollection.each(
                        /**
                         *
                         * @param {ColumnProperties} model
                         */
                            function (model) {
                            var columnRO = ColumnsRoFactory.make(model);
                            if (columnRO.isVisible()) {
                                columnsROCollection.push(columnRO);
                            }
                        });
                    if (this.isAttachmentSupport()) {
                        columnsROCollection.push(new AttachmentColumnRO());
                    }
                    this._columnsRoCollection = columnsROCollection;
                }

                return this._columnsRoCollection;
            },
            /**
             *
             * @returns {ColumnsROCollection}
             * @private
             */
            _getColumnsCardROCollection: function () {
                if (this._columnsCardRoCollection === null) {
                    var columnsCollection = this._getColumnsCollection(),
                        columnsROCollection = new ColumnsROCollection();

                    columnsCollection.each(
                        /** @param {ColumnProperties} model */
                            function (model) {
                            var columnRO = ColumnsRoFactory.make(model);
                            if (columnRO.isVisibleInCard()) {
                                columnsROCollection.push(columnRO);
                            }
                        });
                    this._columnsCardRoCollection = columnsROCollection;
                }

                return this._columnsCardRoCollection;
            },
            isAttachmentSupport: function () {
                return interpreterModule.parseBooleanExpression(this._getDataFormProperties().getAttachmentsSupport(), false);
            },
            /**
             *
             * @returns {String}
             */
            getEntityTypeID: function () {
                return this._getDataFormProperties().getAttachmentsEntityType();
            },
            getParentEntityTypeID: function () {
                var parentModel = this.get('parentModel');
                if (parentModel) {
                    return parentModel.getEntityTypeID();
                } else {
                    return null;
                }
            },
            getParamsForBind: function (pk) {
                return {
                    entityid: pk ? pk : this.get('parentId'),
                    parentid: pk ? pk : this.get('parentId'),
                    entitytype: this.getParentEntityTypeID(),
                    entitytypeid: this.getParentEntityTypeID(),
                    parententitytypeid: this.getParentEntityTypeID(),
                    parententitytype: this.getParentEntityTypeID()
                };
            },
            /**
             * @param {Object} [filterData]
             * @param {string} [mainSql]
             * @returns {Deferred}
             */
            runAsyncTaskBindingReadProc: function (filterData, mainSql) {
                var data = this.getParamsForBind();
                if (filterData) {
                    data = $.extend(data, filterData);
                }
                var sql;
                if (mainSql) {
                    sql = mainSql;
                } else {
                    sql = this._getDataFormProperties().getReadProc();
                }
                return bindModule.runAsyncTaskBindSql(sql, data);
            },
            /**
             *
             * @returns {Object}
             */
            getPreview: function () {
                if (this._preview === null) {
                    var preview = {};
                    this._getColumnsCollection().each(function (column) {
                        if (interpreterModule.parseBooleanExpression(column.getShowInRowDisplay())) {
                            preview[column.getKey()] = {
                                caption: column.getCaption(),
                                type: ['date', 'datetime'].indexOf(column.getEditType()) === -1 ?
                                    's' :
                                    'dt'
                            };
                        }
                    });
                    this._preview = preview;
                }
                return this._preview;

            },
            /**
             *
             * @returns {String}
             */
            getKeyColorColumnName: function () {
                return this._getColumnsCollection().getRowColorColumnName();
            },
            /**
             *
             * @returns {String}
             */
            getColorColumnName: function () {
                return this._getColumnsCollection().getRowColorColumnNameAlternate();
            },
            /**
             * @returns {Object}
             */
            getStorage: function () {
                var cid = this.cid;
                if (!storageModule.hasSession(cid)) {
                    storageModule.addToSession(cid, {
                        data: {},
                        order: [],
                        changed: {},
                        deleted: {}
                    });
                }
                return storageModule.getSession(cid);

            },
            /**
             * @returns {Object}
             */
            getChangedDataFromStorage: function () {
                return this.getStorage().changed;
            },
            /**
             * @returns {Object}
             */
            getDeletedDataFromStorage: function () {
                return this.getStorage().deleted;
            },
            /**
             * @param {string} [id]
             * @returns {Object}
             */
            getDBDataFromStorage: function (id) {
                if (id === undefined) {
                    return this.getStorage().data;
                } else {
                    return this.getStorage().data[id];
                }
            },
            /**
             * @param {string} [id]
             * @returns {Object}
             */
            getActualDataFromStorage: function (id) {
                if (id === undefined) {
                    return helpersModule.merge(
                        this.getDBDataFromStorage(),
                        this.getChangedDataFromStorage()
                    );
                } else {
                    return helpersModule.merge(
                        this.getDBDataFromStorage()[id],
                        this.getChangedDataFromStorage()[id]
                    );
                }
            },
            /**
             * @param id {String|int}
             */
            addDeletedToStorage: function (id) {
                this.getDeletedDataFromStorage()[id] = true;
            },
            /**
             *
             * @param id {string}
             * @param data {object}
             */
            addChangeToStorage: function (id, data) {
                if (this.getChangedDataFromStorage()[id] !== undefined) {
                    data = $.extend({}, this.getChangedDataFromStorage()[id], data);
                }
                this.getChangedDataFromStorage()[id] = data;
            },
            /**
             * @param val {Boolean}
             */
            persistSystemColumnsMode: function (val) {
                storageModule.persistSetting(this.getView(), 'systemVisibleMode', val);
            },
            /**
             * @returns {boolean}
             */
            isSystemColumnsMode: function () {
                var key = this.getView();
                if (storageModule.hasSetting(key, 'systemVisibleMode')) {
                    return storageModule.getSettingByKey(key, 'systemVisibleMode');
                } else {
                    return false;
                }
            },
            /**
             * @param data {Object}
             * @param order {Array}
             */
            persistData: function (data, order) {
                storageModule.addToSession(this.cid, {
                    data: data,
                    order: order,
                    changed: {},
                    deleted: {}
                });
            },
            /**
             * @returns {Array}
             */
            getFormSettingsFromStorage: function () {
                var settings = storageModule.getSettings(),
                    key = this.getView();
                if (!settings.hasOwnProperty(key)) {
                    settings[key] = [];
                }
                if ($.isEmptyObject(settings[key])) {
                    settings[key] = [];
                }
                return settings[key];
            },
            /**
             * @param settings {Object}
             */
            persistColumnsSettings: function (settings) {
                storageModule.persistColumnsSettings(this.getView(), settings);
            },
            /**
             * @param val {Number}
             */
            setFormStyleID: function (val) {
                storageModule.persistSetting(this.getView(), 'globalStyle', val);
            },
            /**
             * @returns {Number}
             */
            getFormStyleID: function () {
                var key = this.getView();
                if (storageModule.hasSetting(key, 'globalStyle')) {
                    return storageModule.getSettingByKey(key, 'globalStyle');
                } else {
                    if (key === optionsModule.getConstants('tasksForTopsXml')) {
                        return 2;
                    } else {
                        return 1;
                    }
                }
            },
            /**
             * @param val {boolean}
             */
            setShortMode: function (val) {
                storageModule.persistSetting(this.getView(), 'shortVisibleMode', val);
            },
            /**
             * @returns {boolean}
             */
            isShortMode: function () {
                return storageModule.getSettingByKey(this.getView(), 'shortVisibleMode') ? true : false;
            },
            /**
             * @returns {boolean}
             */
            isAutoUpdate: function () {
                var key = this.getView();
                if (storageModule.hasSetting(key, 'auto_update')) {
                    return storageModule.getSettingByKey(key, 'auto_update') ? true : false;
                } else {
                    return false;
                }
            },

            /**
             * @description Add opened FormView to cache
             * @param {String} id
             * @param {FormView} view
             */
            addOpenedForm: function (id, view) {
                this._openedForms[id] = view;
            },
            /**
             * @description Delete opened CardView from cache
             * @param id {String}
             */
            deleteOpenedForm: function (id) {
                delete this._openedForms[id];
            },
            /**
             * @description Get opened FormView from cache
             * @param id {string}
             * @returns {FormView|undefined}
             */
            getOpenedForm: function (id) {
                return this._openedForms[id];
            },
            /**
             * @description Add opened CardView to cache
             * @param view {CardView}
             */
            addOpenedCard: function (view) {
                this._openedCards[view.id] = view;
            },
            /**
             * @description Delete opened CardView from cache
             * @param id {String}
             */
            deleteOpenedCard: function (id) {
                delete this._openedCards[id];
            },
            /**
             * @description Get opened CardView from cache
             * @param id {string}
             * @returns {CardView|undefined}
             */
            getOpenedCard: function (id) {
                return this._openedCards[id];
            },
            /**
             * @desc Get All opened card for form
             * @returns {?CardView[]}
             */
            getAllOpenedCard: function () {
                return this._openedCards;
            },
            /**
             * @param data {Object}
             * @returns {Array} Columns keys
             */
            validate: function (data) {
                var requiredFields = this._getRequiredFields(),
                    errors = [];
                requiredFields.forEach(function (key) {
                    if (data[key] === undefined || !data[key]) {
                        errors.push(key);
                    }
                });
                return errors;
            },
            /**
             * @returns {boolean}
             */
            hasSettings: function () {
                return !$.isEmptyObject(this.getFormSettingsFromStorage());
            }
        });
})();
