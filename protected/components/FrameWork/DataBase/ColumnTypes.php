<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 17.04.14
 * Time: 10:29
 */

namespace FrameWork\DataBase;


class ColumnTypes extends \SplEnum{

    const __default = self::String;

    const String = 's';
    const Date = 'dt';
    const Int = 'i';
//    const CheckBox = 'check';
//    const TextBox = 'textbox';
//    const ComboBox = 'combobox'; //Дублирует контрол value list из сетки( функциональность та же самая)
//    const Select = 'select';
//    const Grid = 'grid';

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