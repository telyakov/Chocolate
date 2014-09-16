
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
ChSearchResponse.prototype.destroy= function(){
    delete this.data['data'];
    delete this.data['order'];
    delete this.data['preview'];
    delete this.data['status_code'];
    delete this.data['status_msg']
    delete this.data;
};