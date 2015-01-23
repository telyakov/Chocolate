<?php

namespace FrameWork\DataBase;

use Rmk\Collection\ObjectMap;

class Recordset extends ObjectMap
{
    protected $_data;

    public function __construct($from = null)
    {
        parent::__construct('\FrameWork\DataBase\RecordsetRow', $from);
    }

    public function toRawArray()
    {
        $result = [];
        /**
         * @var $row RecordsetRow
         */
        foreach ($this->array as $row) {
            $result[] = $row->data;
        }
        return $result;
    }

    public function getData($refresh = false)
    {
        if ($this->_data == null || $refresh) {
            $raw = [];
            /**
             * @var RecordsetRow $row
             */
            foreach ($this as $row) {
                $raw[] = $row->data;
            }
            $this->_data = $raw;
        }
        return $this->_data;
    }

    /**
     * @return RecordsetRow
     */
    public function getFirst()
    {
        return parent::getFirst();
    }

}
