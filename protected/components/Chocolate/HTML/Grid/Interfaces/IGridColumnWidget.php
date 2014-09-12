<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 11.12.13
 * Time: 10:49
 */

namespace Chocolate\HTML\Grid\Interfaces;
use FrameWork\DataForm\DataFormModel\ColumnProperties;
use FrameWork\DataForm\DataFormModel\DataFormModel;

interface IGridColumnWidget {
    function __construct(DataFormModel $model);
    /**
     * @param ColumnProperties $columnProperties
     * @return IGridColumnSettings
     */
    public function create(ColumnProperties $columnProperties);
} 