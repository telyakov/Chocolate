<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 20.01.14
 * Time: 9:45
 */

namespace FrameWork\DataBase;


use Rmk\Collection\ObjectMap;
use \FrameWork\DataBase\DataBaseParameter;
class DataBaseParameters extends  ObjectMap{
    CONST PARAM_PREFIX = '@';
    CONST PARAM_DELIMITER = ',';
    public function __construct(array $data = [], $from = null)
    {
        $type = '\FrameWork\DataBase\DataBaseParameter';
        parent::__construct($type, $from);
        $this->init($data);
    }

    public function toArray()
    {
        $result = [];
        /**
         * @var DataBaseParameter $param
         */
        foreach($this as $param){
            $result = array_merge($result, $param->toArray());
        }
        return $result;
    }

    protected function init(array $data){
        array_walk($data, function($value, $name){
           $this->add(new DataBaseParameter($name, $value));
        });
    }

    function __toString()
    {
        $result = self::PARAM_DELIMITER;
        /**
         * @var DataBaseParameter $param
         */
        foreach($this as $param){

            $value = is_null($param->getValue())? 'NULL' :'\'' . $param->getSanitizeValue() .'\'';
            $result .= self::PARAM_PREFIX . $param->getName() . '=' . $value .self::PARAM_DELIMITER;
        }
        return trim($result, self::PARAM_DELIMITER);
    }
}