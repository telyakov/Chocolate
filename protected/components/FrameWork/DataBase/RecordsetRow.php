<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 31.01.14
 * Time: 11:14
 */

namespace FrameWork\DataBase;


class RecordsetRow implements \ArrayAccess{
    public $id;
    public $data;

    public static $prefix =1;
    public function __construct(array $data)
    {
        $this->init($data);
    }

    public function __get($name)
    {
        if(array_key_exists($name, $this->data)){
            return $this->data[$name];
        }else{
            throw new \LogicException('Attempt to read nonexistent recordset field: ' . $name);
        }
    }


    protected function init(array $data){
        $this->data = $data;
        if(array_key_exists('id', $data) && is_null($data['id']) ===false ){
            $this->id = $data['id'];
        }else{
            ++self::$prefix;
            $this->id = uniqid(self::$prefix);
            $this->data['id'] = $this->id;
        }
    }


    public function offsetExists($offset)
    {
        return array_key_exists($offset, $this->data);
    }

    public function offsetSet($offset, $value)
    {
        throw new \LogicException('Unsupported operation.');
    }


    public function offsetGet($offset)
    {
        if($this->offsetExists($offset)){
            return $this->data[$offset];
        }
        return false;
    }

    public function offsetUnset($offset)
    {
        throw new \LogicException('Unsupported operation.');
    }

    public function getFields(array $fields){

        $result = [];
        foreach($this->data as $field =>$value){
            if(array_key_exists($field, $fields)){
                $result[$field] = $value;
            }
        }
        return $result;
    }
}