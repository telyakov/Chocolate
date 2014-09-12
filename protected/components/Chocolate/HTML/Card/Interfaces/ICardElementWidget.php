<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 12.11.13
 * Time: 11:51
 */

namespace Chocolate\HTML\Card\Interfaces;
use FrameWork\DataForm\DataFormModel\ColumnProperties;
use FrameWork\DataForm\DataFormModel\ColumnPropertiesCollection;

interface ICardElementWidget {

    /**
     * @param ColumnProperties $columnProperties
     * @return ICardElementSettings
     */
    public function create(ColumnProperties $columnProperties, ColumnPropertiesCollection $columnPropertiesCollection);

} 