/**
 * @param data {JSON}
 * @constructor
 */
function ChPackageResponse(data) {
    ChResponse.apply(this, arguments);
}
ChPackageResponse.prototype = Object.create(ChResponse.prototype);
ChPackageResponse.prototype.applyResponse = function(){
    this.getData().forEach(function(item){
        var id = item['id'];
        var type = item['type'];
        var data = item['data'];
        var preview = item['preview'];
        var order = item['order'];
        if(type == 'ChGridForm'){
            /**
             *
             * @type {ChGridForm}
             */
            var chForm =ChObjectStorage.create($('#' + id), type);
            chForm.updateData(data, preview, order);
        }
    })
}