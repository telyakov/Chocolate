<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 04.09.13
 * Time: 10:43
 */

namespace ClassModules;
use FrameWork\DataForm\DataFormModel\ColumnProperties as ColumnProperties;
use Chocolate\HTML\ChHtml as ChHtml;


class Attachments extends ColumnProperties {

    CONST KEY = 'numattachments';
    CONST VIEW ='attachments.xml';
    CONST EDIT_TYPE = 'attachments_edit_type';
    public function __construct()
    {
        $properties =  array(
            self::KEY => 'key',
            'Вложения' => 'caption',
            'true' => 'visible',
            self::EDIT_TYPE => 'edittype',
            'attachments' =>'viewname',
            ' false' => 'allfields'
        );
        $xml = new \SimpleXMLElement('<root/>');
        array_walk_recursive($properties, array ($xml, 'addChild'));
        parent::__construct($xml);
    }



}