<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 26.08.14
 * Time: 14:08
 */

namespace Chocolate\HTML\Card\Traits;


trait DefaultHidden {
    function createHiddenFunction(){
        return 'js:function(){$(this).focus()}';
    }
} 