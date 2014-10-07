<?
use \Chocolate\HTML\Card\Settings\Chat;
/**
 * @var $this Controller
 * @var $model GridForm@
 * @var $parentViewID String
 * @var $sql String
 */

$id=\Chocolate\HTML\ChHtml::generateUniqueID();
?>
<section>

    <?
echo CHtml::openTag('form',[
    'id' =>$id,
    'class' => 'discussion-form',
    'data-parent-view' => $model->getParentView(),
    'data-parent-id' => \Chocolate\HTML\ChHtml::ID_KEY
]);
?>
    <section data-id="grid-section">

    <section class="discussion-content">
</section>
</section>

<?
echo CHtml::closeTag('form');
?>
<section class="discussion-footer">
    <textarea class="discussion-input"></textarea>
    <button class="discussion-submit">Отправить</button>
</section>
</section>
<?
Yii::app()->clientScript->registerScript(uniqid(),
    <<<JS

    var form = ChObjectStorage.create($('#'+'$id'), 'ChDiscussionForm');
    form.init('$sql');
    form.refresh();
JS
,CClientScript::POS_READY);
?>



