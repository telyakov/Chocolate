var chApp = chApp || {
    main: Chocolate,
    events: ChocolateEvents,
    options: ChOptions,
    factory: ChObjectStorage,
    responseStatuses: ChResponseStatus,
    draw: new ChocolateDraw(),
    tableHelper: ChTableHelper,
    attachments: ch.attachments,
    callback: ChEditableCallback,
    files: ChAttachments
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
    return this.factory;
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

/**
 * @returns {ChocolateDraw}
 */
chApp.getDraw = function(){
    return this.draw;
};
/**
 * @returns {socket}
 */
chApp.getSocket = function(){
    return socket;
};
/**
 * @returns {chFunctions}
 */
chApp.getFunctions = function(){
    return chFunctions;
};
chApp.getTableHelper = function(){
    return this.tableHelper;
};
/**
 * @returns {ChEditableCallback}
 */
chApp.getCallback = function(){
    return this.callback;
};
/**
 * @returns {ch.attachments}
 */
chApp.getAttachment = function(){
    return this.attachments;
};
/**
 * @returns {ChAttachments}
 */
chApp.getFiles = function(){
    return this.files;
};