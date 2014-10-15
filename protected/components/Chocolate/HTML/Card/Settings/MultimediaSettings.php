<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 12.05.14
 * Time: 8:40
 */

namespace Chocolate\HTML\Card\Settings;


use Chocolate\HTML\ChHtml;

class MultimediaSettings extends EditableCardElementSettings
{

    public function render($pk, $view, $formID, $tabIndex)
    {
        $pk = ChHtml::ID_KEY;
        $sql = addslashes($this->columnProperties->getReadProc());
        $id = ChHtml::generateUniqueID('mm');
        \Yii::app()->clientScript->registerScript($id, <<<JS
    chCardFunction.multimediaInitFunction('$pk', '$sql', '$formID', '$id');
JS
            , \CClientScript::POS_END);
        return '<div class="card-multimedia" id=' . $id . '></div>';

    }

    public function isStatic(){
        return false;
    }

    public function renderBeginData()
    {
        echo '<div class="' . $this->getEditClass() . ' card-input card-grid">';
    }

    public function processBeforeRender($id)
    {
        \Yii::app()->clientScript->registerScript($id, <<<JS
            ChocolateDraw.drawCardGrid($('#' +'$id'));
JS
            , \CClientScript::POS_LOAD);
    }

    public function getMinHeight(){
        return 300;
    }
}