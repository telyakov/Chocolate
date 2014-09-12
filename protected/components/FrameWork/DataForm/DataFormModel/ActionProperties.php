<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 14.06.13
 * Time: 11:39
 * To change this template use File | Settings | File Templates.
 */

namespace FrameWork\DataForm\DataFormModel;
use \FrameWork\DataForm\Traits\Component;

class ActionProperties
{
    use Component;

    protected $caption;
    protected $action;

    public function __construct(\SimpleXMLElement $file)
    {
        $this->init($file, __CLASS__);
    }

    public function getCaption()
    {
        return trim($this->caption);
    }

    public function getAction()
    {
        return trim($this->action);
    }
}