<?
use Chocolate\HTML\Filter\Settings\Select;

/**
 * @var $form ChFilterForm
 * @var $model CModel
 * @var $settings Select
 */
?>
<div class="tree-container">
    <?
   echo $form->dropDownListRow(
       $model,
       $settings->getAttribute(),
       $settings->getData(),
       [
           'id' => uniqid(),
       ]
   );
    ?>
</div>
