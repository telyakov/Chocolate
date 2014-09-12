<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 20.01.14
 * Time: 9:43
 */

namespace FrameWork\DataBase;


class DataBaseParameter {
    protected  $name;
    protected $value;

    function __construct($name, $value)
    {
        $this->name = $name;
        $this->value = $value;
    }

    /**
     * @return mixed
     */
    public function getValue()
    {
        return $this->value;
    }

    /**
     * @return mixed
     */
    public function getName()
    {
        return strtolower($this->name);
    }

    public function  toArray(){
        return [$this->getName() => $this->getValue()];
    }

    public function getSanitizeValue(){
        return self::sanitizeString($this->getValue());
    }

    public static function sanitizeString($str){
        $result = str_replace('\'', '\'\'', $str);
        $result = preg_replace('/(?<!\r)\n/', chr(0x0D). chr(0x0A), $result);
        return $result;
    }
} 