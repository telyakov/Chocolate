<?php
use Chocolate\HTML\Card\Settings\CardElementSettingsCollection;
use FrameWork\DataForm\Card\Card;

/**
 * @var $view String
 * @var $this Controller
 * @var $pk String
 * @var $card Card
 * @var $viewID String
 * @var $CardElementSettingsCollection CardElementSettingsCollection
 */
?>

<?php
//$s = microtime(1);
$this->widget('Chocolate.Widgets.ChCard', [
    'cols' => $card->getCols(),
    'rows' => $card->getRows(),
    'pk' => $pk,
    'view' => $view,
    'viewID' => $viewID,
    'CardElementSettingsCollection' => $CardElementSettingsCollection,
]);
//$s2 = microtime(1) - $s;
//$t= 1;
?>

