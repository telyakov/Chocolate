/**
 * @documentation http://usejsdoc.org/
 */

/**
 * @function
 * @name jQuery.dynatree
 */

/**
 * @function
 * @name jQuery.parent
 */
/**
 * @see https://github.com/nostalgiaz/bootstrap-switch
 * @function
 * @name jQuery.bootstrapSwitch
 */

/**
 * @function
 * @name jQuery.tablesorter
 */
/**
 * @function
 * @name jQuery.chWizard
 */

/**
 * @function
 * @name jQuery.dialog
 */

/**
 * @function
 * @name jQuery.floatThead
 */

/**
 * @function
 * @name jQuery.autocomplete
 */
/**
 * @function
 * @name jQuery.scrollTop
 */

/**
 * @function
 * @name jQuery.contextmenu
 */

/**
 * @function
 * @name Deferred.done
 * @param {function(element:jQuery)} callback
 */
/**
 * @function
 * @name Deferred.fail
 * @param {function(element:jQuery)} callback
 */
/**
 * @function
 * @name Deferred.resolve
 * @param {...*} args
 */
/**
 * @function
 * @name Deferred.reject
 * @param {...*} args
 */
/**
 * Object, that generated in the {FormModel} via event 'save:card'
 * @typedef {Object} CardSaveDTO
 * @property {string} id - Row index
 */
/**
 * Object, that generated in the {FormModel} via event 'save:card'
 * @typedef {Object} FilterLayoutDTO
 * @property {Number} counter - ordinal number
 * @property {String} text -  html filter
 * @property {Function} callback - filter initialize function
 */

/**
 *
 * @typedef {Object} CardElementLayoutDTO
 * @property {Number} x
 * @property {Number} y
 * @property {String} html -  html card element
 * @property {?Function} callback - card element initialize function
 */
/**
 * Object, that generated in the {FormModel} via event 'change:form'
 * @typedef {Object} FormChangeDTO
 * @property {string} op - Type operation: ['upd', 'del', 'ins']
 * @property {string|undefined} id - Row index. For 'del' operations value is undefined
 * @property {object|array} data - Custom data. Fir 'del' operations value is array
 */

/**
 * Object, that represented applications message
 * @typedef {Object} MessageDTO
 * @property {string} msg - Message text
 * @property {Number} id - Message type (1 - success, 2 - warning, 3 - error)
 */

/**
 * Object, that represented response of binding sql
 * @typedef {Object} SqlBindingResponse
 * @property {string} sql - Binding sql
 */


/**
 *
 * @typedef {Object} FormDTO
 * @property {string} id
 * @property {string} write '0', '1', null
 * @property {string} viewname
 * @property {string} parentid
 * @property {string} name
 */

/**
 * Yandex ymaps
 * @typedef {Object} ymaps
 * @property {Function} Map - constructor
 */

/**
 * Yandex Map Object
 * @typedef {Object} ymaps.Map
 * @property {{fitToViewport: function} container
 * @property {string} controls
 * @property {string} geoObjects
 */

/**
 * Object, that represented settings Columns
 * @typedef {Object} SettingsColumn
 * @property {string} key - unique column key
 * @property {Number} weight - column order
 * @property {Number} width - column width in px
 */

/**
 * Object, that represented response for chFormRefresh socket type request
 * @typedef {Object} RecordsetDTO
 * @property {Object} data - data
 * @property {Array} order - order rows in data
 */

/**
 * Object, that represented recordset response for CanvasVIew
 * @typedef {Object} CanvasRecordset
 * @property {String} axis
 * @property {String} prenumber
 * @property {String} flatstypesname
 * @property {String} costcurrent
 * @property {String} sqrplanreduced
 * @property {String} sqrplanfullkitchen
 * @property {String} bl
 * @property {String} color
 */
/**
 * Object, that generated in the {FormModel} via event 'save:form'
 * @typedef {Object} SaveDTO
 * @property {Object} refresh - Indicates whether to refresh form
 */

/**
 * Object, that represented response for deferred socket type request
 * @typedef {Object} BooleanResponse
 * @property {Boolean} value
 */

/**
 * Object, that represented response for deferred socket type request
 * @typedef {Object} DeferredResponse
 * @property {Object} data
 */

/**
 * Object, that generated in the {FormModel} via event 'refresh:form'
 * @typedef {Object} RefreshDTO
 * @property {boolean} isLazy - Indicates whether to use lazy refresh
 * @property {boolean} afterSave - Indicates whether refresh event called after save
 */

/**
 * Options to initialize AbstractView class
 * @typedef {Object} AbstractViewOptions
 * @property {jQuery} $el - A cached jQuery object for the view's element
 * @property {FormModel} model - Main model
 * @property {FormView} view - Main view
 */

/**
 * @function
 * @name AbstractView.listenTo
 * @param {Backbone.Model} other
 * @param {string} event
 * @param {function} callback
 */



//todo: 1)Поддержка типа Deferred,  2)jquery, 3)custom object Types, 4)Event