<?php
namespace Chocolate\HTML;
use FrameWork\DataBase\Recordset;
use FrameWork\DataBase\RecordsetRow;
use FrameWork\DataForm\DataFormModel\ColumnProperties as ColumnProperties;
use FrameWork\DataForm\DataFormModel\ColumnPropertiesCollection as ColumnPropertiesCollection;

/**
 * Класс Helper для построения различных HTML объектов
 * Class ChHtml
 * @package Chocolate\HTML
 */
class ChHtml
{
    CONST ID_KEY = '00pk00';

    public static function generateUniqueID($prefix = ''){
        return uniqid($prefix. self::ID_KEY);
    }

    static function createListData(Recordset $data)
    {
//        $listData = array();
//        $listData[] = '';
        $listData = array_merge([''=>''],self::createMultiSelectListData($data));
        return $listData;
    }

    static function createMultiSelectListData(Recordset $recordset)
    {
        $listData = array();
        /**
         * @var $row RecordsetRow
         */
        foreach($recordset as $row){
            $listData[$row->id] = $row['name'];
        }
        return $listData;
    }

}