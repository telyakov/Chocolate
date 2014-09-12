<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 30.01.14
 * Time: 16:04
 */

namespace Chocolate\Cache;


use FrameWork\DataBase\DataBaseRoutine;

class ConnectionDependency extends \CExpressionDependency {
    protected $routine;

    public function __construct($expression = 'true', DataBaseRoutine $routine)
    {
        parent::__construct($expression);
        $this->routine = $routine;
    }

    protected function generateDependentData()
    {
        if(!is_string($this->expression) && is_callable($this->expression))
            return call_user_func($this->expression, $this->routine);
        else
            return @eval('return '.$this->expression.';');
    }


} 