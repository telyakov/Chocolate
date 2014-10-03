<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 12.11.13
 * Time: 11:36
 */

namespace FrameWork\DataForm\Card;


class CardElementType extends \SplEnum {
    const __default = self::Text;

    const Text = 'text';
    const Date = 'date';
    const DateTime= 'datetime';
    const CheckBox = 'check';
    const TextBox = 'textbox';
    const ComboBox = 'combobox'; //Дублирует контрол value list из сетки( функциональность та же самая)
    const Select = 'select';
    const Grid = 'grid';
    const Multimedia = 'multimedia';
    const Line = 'line';
    const Chat = 'discussionform';

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