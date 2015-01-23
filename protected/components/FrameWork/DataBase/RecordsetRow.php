<?php

namespace FrameWork\DataBase;

class RecordsetRow implements \ArrayAccess
{
    public static $prefix = 1;
    public $id;
    public $data;

    public function __construct(array $data)
    {
        $this->init($data);
    }

    protected function init(array $data)
    {
        $this->data = $data;
        if (array_key_exists('id', $data) && is_null($data['id']) === false) {
            $this->id = $data['id'];
        } else {
            ++self::$prefix;
            $this->id = uniqid(self::$prefix);
            $this->data['id'] = $this->id;
        }
    }

    public function __get($name)
    {
        if (array_key_exists($name, $this->data)) {
            return $this->data[$name];
        } else {
            throw new \LogicException('Attempt to read nonexistent recordset field: ' . $name);
        }
    }

    public function offsetSet($offset, $value)
    {
        throw new \LogicException('Unsupported operation.');
    }

    public function offsetGet($offset)
    {
        if ($this->offsetExists($offset)) {
            return $this->data[$offset];
        }
        return false;
    }

    public function offsetExists($offset)
    {
        return array_key_exists($offset, $this->data);
    }

    public function offsetUnset($offset)
    {
        throw new \LogicException('Unsupported operation.');
    }

}