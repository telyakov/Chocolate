<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 27.09.13
 * Time: 11:21
 */

namespace Chocolate\HTML\Filter\Interfaces;


use FrameWork\DataForm\DataFormModel\AgileFilter;
use FrameWork\DataForm\DataFormModel\FilterType;

interface IFilterWidget {
    /**
     * @param FilterType $controlType
     * @return IFilterSettings
     */
    public function create(AgileFilter $filter);
}