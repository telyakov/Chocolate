<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 27.06.14
 * Time: 12:45
 */

namespace FrameWork\DataForm\DataFormModel;


use Chocolate\HTML\ColorAdapter;

class ColumnCustomProperties {
    CONST PROP_DELIMITER = '|';
    CONST VALUE_DELIMITER = '=';
    protected $expression;
    protected $label = 'check';
    protected $color;
    protected $priority = 1;
    protected $markupSupport = false;

    public function __construct($expression = '')
    {
        $this->expression = $expression;
        $this->init();
    }

    protected function init(){
        $properties = explode(self::PROP_DELIMITER, $this->expression);
        foreach($properties as $property){
            switch(true){
                case stripos($property, 'label')!==false:
                    if(strpos($property, self::VALUE_DELIMITER) !== false){
                        $tokens = explode(self::VALUE_DELIMITER, $property);
                        $this->label = $tokens[1];
                    }
                    break;
                case stripos($property, 'color')!==false:
                    if(strpos($property, self::VALUE_DELIMITER) !== false){
                        $tokens = explode(self::VALUE_DELIMITER, $property);
                        $this->color = ColorAdapter::decToHex($tokens[1]);
                    }
                    break;
                case stripos($property, 'priority')!==false:
                    if(strpos($property, self::VALUE_DELIMITER) !== false){
                        $tokens = explode(self::VALUE_DELIMITER, $property);
                        $this->priority = $tokens[1];
                    }
                    break;
                case stripos($property, 'markupsupport')!==false:
                    $this->markupSupport = true;
                    break;
                default:
                    break;
            }
    }
    }

    /**
     * @return boolean
     */
    public function isMarkupSupport()
    {
        return $this->markupSupport;
    }
    /**
     * @return string
     */
    public function getLabel(){
       return $this->label;
    }
    /**
     * @return string|null
     */
    public function getColor()
    {
        return $this->color;
    }

    /**
     * @return string|null
     */
    public function getPriority()
    {
        return $this->priority;
    }

} 