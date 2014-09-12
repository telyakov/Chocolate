function MajesticQueue() {
    this.queue = [];
}
MajesticQueue.prototype = {

    enqueue: function (mjMethod) {
        this.queue.push(mjMethod);
        return this;
    },
    dequeue: function () {
        return this.queue.shift();
    },
    valid: function () {
        return this.queue.length > 0;
    }
}