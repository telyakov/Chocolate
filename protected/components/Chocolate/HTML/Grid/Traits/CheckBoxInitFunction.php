<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 25.06.14
 * Time: 11:12
 */

namespace Chocolate\HTML\Grid\Traits;


trait CheckBoxInitFunction {

    public function createInitFunction( $attribute, $allowEdit){
        $initScript = <<<JS
        chFunctions.checkBoxInitFunc($(this), '$attribute', '$allowEdit');
JS;
        return 'js:function(){' . $initScript . '}';
    }
} 