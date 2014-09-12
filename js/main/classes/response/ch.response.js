/**
 * Класс - обертка на js для класса Response.php.
 */
function ChResponse(json_data) {
    this.data = json_parse(json_data, Chocolate.parse);
}

ChResponse.prototype = {
    getData: function () {
        return this.data['data'];
    },
    getStatusCode: function () {
        return this.data['status_code'];
    },
    getStatusMsg: function () {
        return this.data['status_msg'];
    },
    hasError: function () {
        var status_code = this.getStatusCode();
        if (status_code == ChResponseStatus.ERROR) {
            return true;
        }
        return false;
    },
    isSuccess: function () {
        return !this.hasError();
    },
    /**
     * @param ch_message_container {ChMessagesContainer}
     */
    sendMessage: function (ch_message_container) {
        ch_message_container.sendMessage(this.getStatusMsg(), this.getStatusCode());
    }
}