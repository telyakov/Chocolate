/**
 * @param id {string}
 * @param chObjectClass {string}
 * @param params {Object}
 * @constructor
 */
function ChAjaxTask(id, chObjectClass, params) {
    this.id = id;
    this.chObjectClass = chObjectClass;
    this.params = params;
}
var chAjaxQueue = {
    queue: [],
    /**
     *
     * @param ChAjaxTask {ChAjaxTask}
     * @returns {chAjaxQueue}
     */
    enqueue: function (ChAjaxTask) {
        this.queue.push(ChAjaxTask);
        return this;
    },
    /**
     * @returns {boolean}
     */
    isNotEmpty: function () {
        return this.queue.length != 0;
    },
    /**
     * @returns {Object}
     */
    dequeueAll: function () {
        var data = {}, i = 0;
        while (this.isNotEmpty()) {
            i++;
            /**
             * @type {ChAjaxTask}
             */
            var task = this.queue.shift();
            data[i] = {
                id: task.id,
                type: task.chObjectClass,
                params: task.params
            };
        }
        return data;
    },
    send: function () {
        if (this.isNotEmpty()) {
            var data = this.dequeueAll();
            $.post(ChOptions.urls.queueExecute, {
                package: data
            })
                .done(function (response) {
                    try {
                        var chResponse = new ChPackageResponse(response);
                        chResponse.applyResponse();
                    } catch (e) {
                        Chocolate.log.error(
                            'Возникла ошибка при обработке ответа выполнения  ajax - очереди с сервера на клиенте',
                            e
                        );
                    }
                })
                .fail(function (response) {
                    Chocolate.log.error(
                        'Возникла ошибка на сервере при отправке ajax - очереди',
                        data,
                        response.responseText,
                        response.status
                    );
                })
        }
    }
};