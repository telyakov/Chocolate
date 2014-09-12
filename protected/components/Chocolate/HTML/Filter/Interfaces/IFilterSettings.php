<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 27.09.13
 * Time: 13:16
 */

namespace Chocolate\HTML\Filter\Interfaces;


use FrameWork\DataForm\DataFormModel\AgileFilter;
use FrameWork\DataForm\DataFormModel\FilterProperties;
use FrameWork\DataForm\DataFormModel\FilterType;
interface IFilterSettings {
    public function __construct(AgileFilter $filter);
    public function toArray();
    public function getParentFilterKey();
    /**
     * @return FilterType
     */
    public function getType();
    public function getName();
    public function getData();
    public function getAttribute();
    public function getToolTip();
    public function isNextRow();

    /**
     * @return FilterProperties
     */
    public function getProperties();

    /**
     * @return mixed
     */
    public function render(\CModel $model, \ChFilterForm $form);
}