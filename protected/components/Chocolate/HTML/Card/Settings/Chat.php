<?

namespace Chocolate\HTML\Card\Settings;


use Chocolate\HTML\ChHtml;

class Chat extends EditableCardElementSettings
{
    public function isStatic()
    {
        return false;
    }

    public static function getSql(\GridForm $model)
    {
        $model->getDataFormModel()->setParentID(ChHtml::ID_KEY);
        return addslashes(\Yii::app()->bind->bindProcedureFromData($model->getDataFormProperties()->getReadProc(), null, true, $model->getDataFormModel())->__toString());
    }

    public function render($pk, $view, $formID, $tabIndex)
    {
        $model = \Controller::loadForm('discussions.xml', $view, ChHtml::ID_KEY);
        $data = \Yii::app()->controller->renderPartial('//discussions/index', [
            'model' => $model,
            'parentViewID' => $formID,
            'sql' => $this->getSql($model)
        ], true);
        return $data;
    }

    public function renderBeginData()
    {
        echo '<div class="card-input card-grid">';
    }

    public function processBeforeRender($id)
    {
        $this->doNothing();
    }

    private function doNothing()
    {

    }

} 