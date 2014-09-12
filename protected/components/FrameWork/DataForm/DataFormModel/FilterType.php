<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 26.09.13
 * Time: 15:34
 */

namespace FrameWork\DataForm\DataFormModel;


class FilterType extends \SplEnum{

    const __default = self::Keys;

    const Keys = 'keys';
    const CheckBox = 'checkbox';
    const Tree = 'checkbox_tree';
    const CustomFilterWithMultiselect = 'customfilter_with_multiselect';
    const CustomFilter = 'customfilter';
    const DateBetween = 'datebetween';
    const FastFilter = 'fastfilter';

    public function __construct($initial_value = self::__default, $strict = true)
    {
        $types = $this->getConstList();
        if(in_array($initial_value, $types)){
            $value = $initial_value;
        }else{
            $value = self::__default;
        }
        parent::__construct($value, $strict);
    }

}