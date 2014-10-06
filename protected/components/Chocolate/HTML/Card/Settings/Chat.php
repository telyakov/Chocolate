<?

namespace Chocolate\HTML\Card\Settings;


use Chocolate\HTML\ChHtml;

class Chat extends EditableCardElementSettings {
    public function isStatic(){
        return false;
    }
    public function getSql(\GridForm $model){
       return  addslashes(\Yii::app()->bind->bindProcedureFromData($this->columnProperties->getReadProc(), null, true,$model->getDataFormModel())->__toString());
    }
    public function render($pk, $view, $formID, $tabIndex)
    {
        $model = \Controller::loadForm('discussions.xml', $view , ChHtml::ID_KEY);
        $data = \Yii::app()->controller->renderPartial('//discussions/index', [
            'model' => $model,
            'parentViewID' => $formID,
            'settings' => $this
        ], true);
        return $data;
    }

    public function renderBeginData()
    {
        echo '<div class="card-input card-grid">';
    }
    public function processBeforeRender($id)
    {
//        \Yii::app()->clientScript->registerScript($id, <<<JS
//            ChocolateDraw.drawCardGrid($('#' +'$id'));
//JS
//            , \CClientScript::POS_LOAD);
    }

} 