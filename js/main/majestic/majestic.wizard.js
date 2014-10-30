function MajesticWizard() {
    this.queue = [];
    this._steps_count = null;
}
MajesticWizard.prototype.enqueue = function (mjMethod) {
    this.queue.push(mjMethod);
    return this;
};
MajesticWizard.prototype.dequeue = function () {
    return this.queue.shift();
};
MajesticWizard.prototype.valid = function () {
    return this.queue.length > 0;
};
MajesticWizard.prototype.run = function () {
    this._steps_count = this.queue.length;
    this.next();
};
MajesticWizard.prototype.getStepsCount = function(){
    return this._steps_count;
};
MajesticWizard.prototype.getCurrentStep = function(){
    return this.getStepsCount() - this.queue.length;
};
MajesticWizard.prototype.cancel = function () {
    throw 'Необходимо реализовать метод exit для MajesticWizard';
};
MajesticWizard.prototype.done = function () {
    throw 'Необходимо реализовать метод done для MajesticWizard';
};
MajesticWizard.prototype.next = function () {
    if (this.valid()) {
        /**
         * @param mjMethod {MajesticWizardMethod}
         */
        var mjMethod = this.dequeue();
        mjMethod.run(this);
    } else {
        this.done();
    }
};