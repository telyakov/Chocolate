<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 11.12.13
 * Time: 10:54
 */

namespace Chocolate\HTML\Grid\Interfaces;


use FrameWork\DataForm\DataFormModel\ColumnProperties;
use FrameWork\DataForm\DataFormModel\DataFormModel;

interface IGridColumnSettings {
    function __construct(ColumnProperties $columnProperties, DataFormModel $model);
    function getHeader();
    function getName();
    function isRequired();
    function getAllowEdit();
    function getData();

    /**
     * @return boolean
     */
    function isSingle();

} 