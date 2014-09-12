<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 11.12.13
 * Time: 15:12
 */

namespace Chocolate\HTML\Grid\Traits;


trait Select2ColumnInitFunction {
    public function createSelect2InitFunction(){
        $initScript = <<<JS
chCardFunction.select2ColumnInitFunction(element, callback);
JS;
        return 'js:function(element, callback){' . $initScript . '}';
    }

} 