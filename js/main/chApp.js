/**
 * Pattern Namespacing. http://addyosmani.com/blog/essential-js-namespacing/
 */
var chApp = chApp || {
    main: Chocolate,
    responseStatuses: ChResponseStatus
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
