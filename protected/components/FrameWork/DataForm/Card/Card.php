<?php
namespace FrameWork\DataForm\Card;

use FrameWork\DataForm\Traits\Component;

class Card
{
    use Component;

    protected $key;
    protected $caption;
    protected $cols;
    protected $rows;
    protected $col;
    protected $row;
    protected $cellwidth;
    protected $cellheight;
    protected $fixedwidth;
    protected $fixedheight;
    protected $captionreadproc;
    protected $visible;


    public function getCaptionReadProc()
    {
        return $this->captionreadproc;
    }

    public function __construct(\SimpleXMLElement $properties)
    {
        $this->init($properties, __CLASS__);
    }

    public function getCols()
    {
        return $this->cols;
    }

    public function getRows()
    {
        return $this->rows;
    }

    public function getCaption()
    {
        return $this->caption;
    }

    public function getKey()
    {
        return $this->key;
    }

    public function isVisible()
    {
        return self::boolExpressionEval($this->visible, true);
    }

}