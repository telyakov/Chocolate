/**
 * Pattern Namespacing. http://addyosmani.com/blog/essential-js-namespacing/
 */
var chApp = chApp || {
    main: Chocolate,
    responseStatuses: ChResponseStatus,
    attachments: ch.attachments
};
/**
 * @returns {Chocolate}
 */
chApp.getMain = function () {
    return this.main;
};
/**
 * @returns {ChResponseStatus}
 */
chApp.getResponseStatuses = function () {
    return this.responseStatuses;
};
/**
 * @returns {chFunctions}
 */
chApp.getFunctions = function(){
    return chFunctions;
};
/**
 * @returns {ch.attachments}
 */
chApp.getAttachment = function(){
    return this.attachments;
};