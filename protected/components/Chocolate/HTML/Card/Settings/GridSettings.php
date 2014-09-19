<?
namespace Chocolate\HTML\Card\Settings;

use Chocolate\HTML\ChHtml;
use ClassModules\Attachments;

class GridSettings extends EditableCardElementSettings
{
    public function isStatic(){
        return false;
    }
    public function getMinHeight(){
        return 215;
    }

    public function getSql(\GridForm $model){
        if(($routine = $this->columnProperties->getReadProc())){
            $routine  = \Yii::app()->bind->bindProcedureFromModel($routine, $model->getDataFormModel());
        }else{
            $routine = \Yii::app()->bind->bindProcedureFromData($model->getDataFormProperties()->getReadProc(), false, $model->getDataFormModel());
        }
        return addslashes($routine);
    }

    public function render($pk, $view, $formID, $tabIndex)
    {
        $currentView = $this->columnProperties->getViewName();
        if (!\GridForm::isAttachment($currentView)) {
        $model = \Controller::loadForm($currentView, $view, ChHtml::ID_KEY);
            if ($this->columnProperties->getEditBehavior() == 'showjournal') {
                $model->attributes = [
                    'filters' => [
                        'entityid' => ChHtml::ID_KEY,
                        'tabid' => $this->columnProperties->getTabId()
                    ]
                ];
            }else{
                $model->attributes = [
                    'filters' => [
                        'parentid' => ChHtml::ID_KEY
                    ]
                ];
            }
            return \Yii::app()->controller->renderPartial('//card/_grid',
                [
                    'model' => $model,
                    'parentViewID' => $formID,
                    'sql' => $this->getSql($model)
                ],
                true,
                false
            );
        } else {

            return \Yii::app()->controller->renderPartial('//attachments/index',
                [
                    'model' => \Controller::loadForm($currentView, $view, $pk),
                    'parentViewID' => $formID,

                ],
                true,
                false
            );
        }
    }

    public function renderBeginData()
    {
        echo '<div class="'.$this->getEditClass().' card-input card-grid">';
    }
    public function processBeforeRender($id)
    {
        \Yii::app()->clientScript->registerScript($id, <<<JS
            ChocolateDraw.drawCardGrid($('#' +'$id'));
JS
            , \CClientScript::POS_LOAD);
    }

}