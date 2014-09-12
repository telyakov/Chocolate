
/**
 * Класс, отвечащий за отображение сообщений на клиенте.
 */
function ChMessagesContainer($message_container) {
    this.$message_container = $message_container;
}
ChMessagesContainer.prototype = {
    sendMessage: function (status_msg, status_code) {
        switch (status_code) {
            case ChResponseStatus.ERROR:
                this._sendErrorMessage(status_msg);
                break;
            case ChResponseStatus.SUCCESS:
                this._sendSuccessMessage(status_msg, 5000);
                break;
            case ChResponseStatus.WARNING:
                this._sendWarningMessage(status_msg)
                break;
            default:
                this._sendErrorMessage(status_msg);
                break;
        }
    },
    _sendSuccessMessage: function (status_msg, duration) {
        this._appendMessage('<div class="grid-message"><div class="alert in alert-block fade alert-success">' + status_msg + '</div></div>', duration);
    },
    _appendMessage: function (html, duration) {
        var $message = this.$message_container;
        $message.html(html);
        if (duration) {

            setTimeout(function () {
                $message.html('')
            }, duration);
        }
    },
    _sendErrorMessage: function (status_msg) {
        this._appendMessage('<div class="grid-message"><div class="alert in alert-block fade alert-error">' + status_msg + '</div></div>', 5000);
    },
    _sendWarningMessage: function (status_msg) {
        this._appendMessage('<div class="grid-message"><div class="alert in alert-block fade alert-warning">' + status_msg + '</div></div>', 5000);
    }
};