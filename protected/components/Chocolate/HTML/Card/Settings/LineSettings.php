<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 29.05.14
 * Time: 16:18
 */

namespace Chocolate\HTML\Card\Settings;


class LineSettings extends EditableCardElementSettings {

    public function render($pk, $view, $formID, $tabIndex)
    {
        return '<span>'. $this->getCaption().'</span>';
    }

    public function renderBeginData()
    {
    }

    public function renderEndData()
    {
    }

    public function processBeforeRender($id)
    {
    }


}