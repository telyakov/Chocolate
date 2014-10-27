/**
 * Pattern Mediator. Documentation: http://largescalejs.ru/the-mediator-pattern/
 */
var mediator = (function() {
    var subscribe = function(channel, fn) {
            if (!mediator.channels[channel]) {mediator.channels[channel] = [];}
            mediator.channels[channel].push({ context: this, callback: fn });
            return this;
        },

        publish = function(channel) {
            if (!mediator.channels[channel]) {return false;}
            var args = Array.prototype.slice.call(arguments, 1);
            for (var i = 0, l = mediator.channels[channel].length; i < l; i++) {
                var subscription = mediator.channels[channel][i];
                subscription.callback.apply(subscription.context, args);
            }
            return this;
        };

    return {
        channels: {},
        publish: publish,
        subscribe: subscribe,
        installTo: function(obj) {
            obj.subscribe = subscribe;
            obj.publish = publish;
        }
    };

}());

/**
 * Pattern Namespacing. http://addyosmani.com/blog/essential-js-namespacing/
 */
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
    files: ChAttachments,
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
    return this.responseStatuses;
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
    return this.main.socket;
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
