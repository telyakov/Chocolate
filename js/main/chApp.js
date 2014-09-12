var chApp = chApp || {
    main: Chocolate,
    events: ChocolateEvents,
    options: ChOptions,
    factory: ChObjectStorage,
    responseStatuses: ChResponseStatus,
    draw: ChocolateDraw,
    tableHelper: ChTableHelper,
    attachments: ch.attachments
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
 * @returns {Chocolate}
 */
chApp.getMain = function () {
    return this.main;
};
/**
 * @returns {ChOptions.messages.ru}
 */
chApp.getMessages = function () {
    return this.options.messages[chApp.getMain().locale];
};
/**
 * @returns {ChObjectStorage}
 */
chApp.getFactory = function () {
    return this.options.factory;
};
/**
 * @returns {ChResponseStatus}
 */
chApp.getResponseStatuses = function () {
    return this.options.responseStatuses;
};
/**
 * @returns {bindingService}
 */
chApp.getBindService = function(){
    return bindingService;
};
/**
 * @returns {ChOptions}
 */
chApp.getOptions = function(){
   return this.options;
};