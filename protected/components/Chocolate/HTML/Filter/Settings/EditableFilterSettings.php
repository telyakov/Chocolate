<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 27.09.13
 * Time: 16:41
 */

namespace Chocolate\HTML\Filter\Settings;
use FrameWork\DataForm\DataFormModel\AgileFilter;
use Chocolate\HTML\Filter\Interfaces\IFilterSettings;

abstract class EditableFilterSettings implements IFilterSettings {

    public $filter;
    public function __construct(AgileFilter $filter)
    {
        $this->filter = $filter;
    }


    public function getParentFilterKey(){
        return $this->filter->getParentFilterKey();
    }

    /**
     * @return \FrameWork\DataForm\DataFormModel\FilterType
     */
    public function getType()
    {
        return $this->filter->getFilterType();
    }

    public function getName()
    {
        return $this->filter->getName();
    }

    public function isMultiSelect(){
        return $this->filter->isMultiSelect();
    }
    public function getAttribute(){
        return $this->filter->getNameInModel();
    }

    public function getData($parentID = null){
        return $this->filter->getData($parentID);
    }

    public function getToolTip(){
        return $this->filter->getToolTipText();
    }

    public function toArray(){
        return [
            'attribute' => $this->getAttribute(),
            'name' => $this->getName()
        ];
    }

    public function getProperties(){
        return $this->filter->getProperties();
    }

    public function isNextRow()
    {
        return $this->filter->isNextRow();
    }


}