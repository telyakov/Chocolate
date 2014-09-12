<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 25.09.13
 * Time: 12:42
 */

namespace FrameWork\XML;
use FrameWork\DataForm\Card\CardCollection ;
use FrameWork\DataForm\DataFormModel\AgileFiltersCollection;
use FrameWork\DataForm\DataFormModel\ColumnProperties;
use FrameWork\DataForm\DataFormModel\ColumnPropertiesCollection ;
use FrameWork\DataForm\DataFormModel\DataFormProperties ;
use FrameWork\DataForm\DataFormModel\GridProperties;
use FrameWork\DataForm\DataFormModel\ActionPropertiesCollection;
class XmlData {

    /**
     * @var $agileFiltersCollection AgileFiltersCollection
     */
    public $agileFiltersCollection;
    /**
     * @var $columnPropertiesCollection ColumnPropertiesCollection
     */
    public $columnPropertiesCollection;
    /**
     * @var DataFormProperties $dataFormProperties
     */
    public $dataFormProperties;
    /**
     * @var CardCollection $cardCollection
     */
    public $cardCollection;
    /**
     * @var  $gridProperties GridProperties
     */
    public $gridProperties;

    /**
     * @var $actionPropertiesCollection ActionPropertiesCollection;
     */
    public $actionPropertiesCollection;

    public static function getCacheID($file){
        return __CLASS__ . $file ;
    }
}