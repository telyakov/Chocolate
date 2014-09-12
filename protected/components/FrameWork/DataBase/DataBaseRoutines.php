<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 18.06.13
 * Time: 15:34
 * To change this template use File | Settings | File Templates.
 */
use \FrameWork\DataBase\DataBaseRoutine;

class DataBaseRoutines extends SplQueue{
    public function enqueue(DataBaseRoutine $routine)
    {
        parent::enqueue($routine);
    }

    public function push(DataBaseRoutine $routine)
    {
        parent::push($routine);
    }

    /**
     * @return DataBaseRoutine
     */
    public function dequeue()
    {
        parent::dequeue();
    }

    public function toArray(){
        $result = [];
        /**
         * @var $routine DataBaseRoutine
         */
        foreach($this as $routine){
            $result[] = $routine->__toString();
        }
        return $result;
    }

}
