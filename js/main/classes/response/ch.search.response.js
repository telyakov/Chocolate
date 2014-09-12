
function ChSearchResponse(json_data) {
    ChResponse.apply(this, arguments);
}
ChSearchResponse.prototype = Object.create(ChResponse.prototype);
ChSearchResponse.prototype.getPreview = function () {
    return this.data['preview'];
};
ChSearchResponse.prototype.getOrder = function(){
    return this.data['order'];
};