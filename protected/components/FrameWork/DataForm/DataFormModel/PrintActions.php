<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 18.04.14
 * Time: 11:03
 */

namespace FrameWork\DataForm\DataFormModel;


class PrintActions {
    CONST KEYS_DELIMITER = ' ';
    CONST ACTION_DELIMITER = '|';
    CONST TITLE_DELIMITER = '=';
    private $expression;
    private $actions = [];

    /**
     * @return array
     */
    public function getActions()
    {
        return $this->actions;
    }
    public function __construct($expression )
    {
        $this->expression = $expression;
        $this->init();
    }

    public function init(){
        $actions = explode(self::ACTION_DELIMITER, $this->expression);
        foreach($actions as $action){
            if(($index = strpos($action, self::TITLE_DELIMITER))!==false){
                $title = trim(substr($action, 0, $index));
                $cmd = trim(substr($action,$index + strlen(self::TITLE_DELIMITER)));
                $this->actions[] = ['title' => $title, 'cmd' => trim($cmd, self::ACTION_DELIMITER)];
            };
        }
    }
    public function isNotEmpty(){
        return !empty($this->actions);
    }
} 