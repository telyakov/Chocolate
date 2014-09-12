<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 11.12.13
 * Time: 11:21
 */

namespace FrameWork\DataForm\DataFormModel;


use ClassModules\Attachments;

class GridColumnType extends \SplEnum{
    const __default = self::Text;
    const Text = 'text';
    const Date = 'date';
    const ValueListWithoutBlank = 'valuelistwithoutblank';
    const ValueList = 'valuelist';
    const SelectItems = 'selectitems';
    const DateTime= 'datetime';
    const CheckBox = 'checkbox';
    const Attachments = Attachments::EDIT_TYPE;
    const Button = 'button';
    const OnOff= 'onoff';
    const TextDialog = 'texdialog';
    const TreeDialog = 'treedialog';

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