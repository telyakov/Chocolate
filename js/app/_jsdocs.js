/**
 * @function
 * @name jQuery.dynatree
 */

/**
 * @function
 * @name jQuery.parent
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
 * @name Deferred.done
 * @param {function(element:jQuery)} callback
 */

/**
 * Object, that generated in the {FormModel} via event 'save:card'
 * @typedef {Object} CardSaveDTO
 * @property {string} id - Row index
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
 *  Object, that generated in the {FormModel} via event 'save:form'
 * @typedef {Object} SaveDTO
 * @property {Object} refresh - Indicates whether to refresh form
 */


//todo: 1)Поддержка типа Deferred,  2)jquery, 3)custom object Types, 4)Event