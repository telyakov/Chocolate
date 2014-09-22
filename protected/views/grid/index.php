<?
/**
 * @var $model GridForm,
 * @var $this Controller
 * @var $parentViewID String|null
 */
//$start = microtime(1);

$tabID = uniqid('tb');?>
<div id='<?php echo $tabID ?>'>
<?
$this->renderPartial('grid', [
   'tabID' => $tabID,
    'model' => $model,
    'parentViewID' => $parentViewID
]);
?>
</div>

<script>
    $(function () {
        Chocolate.tab.addAndSetActive(
          '<? echo $tabID ?>',
          '<? echo $model->getDataFormProperties()->getWindowCaption()?>'
        );
    })
</script>
<?
//$end = microtime(1) - $start;
//$tt = '';

?>





