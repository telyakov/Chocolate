function ChGridResponse(json_data) {
    this.data = JSON.parse(json_data);
}
ChGridResponse.prototype = Object.create(ChResponse.prototype);