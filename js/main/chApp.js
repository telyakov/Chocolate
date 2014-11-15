/**
 * Pattern Namespacing. http://addyosmani.com/blog/essential-js-namespacing/
 */
var chApp = chApp || {
    main: Chocolate,
    events: ChocolateEvents,
    options: ChOptions,
    responseStatuses: ChResponseStatus,
    attachments: ch.attachments,
    callback: ChEditableCallback,
    mediator: mediator
};
chApp.namespace = function (ns) {
    var parts = ns.split('.'),
        parent = chApp,
        i;

    if (parts[0] === "chApp") {
        parts = parts.slice(1);
    }

    for (i = 0; i < parts.length; i += 1) {
        if (typeof parent[parts[i]] === "undefined") {
            parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
    }
    return parent;
};
/**
 *
 * @returns {mediator}
 */
chApp.getMediator = function(){
    return this.mediator;
};
/**
 * @returns {Chocolate}
 */
chApp.getMain = function () {
    return this.main;
};
/**
 * @returns {ChOptions.messages.ru}
 */
chApp.getMessages = function () {
    return this.options.messages[this.options.settings.locale];
};

/**
 * @returns {ChResponseStatus}
 */
chApp.getResponseStatuses = function () {
    return this.responseStatuses;
};
/**
 * @returns {ChOptions}
 */
chApp.getOptions = function(){
    return this.options;
};

/**
 * @returns {chFunctions}
 */
chApp.getFunctions = function(){
    return chFunctions;
};
/**
 * @returns {ChEditableCallback}
 */
chApp.getCallback = function(){
    return this.callback;
};