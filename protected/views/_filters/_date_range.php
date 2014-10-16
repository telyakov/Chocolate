<?
use Chocolate\HTML\Filter\Settings\DateRange;

/**
 * @var $form ChActiveForm
 * @var $model GridForm
 * @var $settings DateRange
 */
?>
<div>
    <?
    $attribute = $settings->getAttributeFrom();
    echo $form->labelEx($model, $attribute);
    $form->widget('zii.widgets.jui.CJuiDatePicker', [
        'model' => $model,
        'attribute' => $attribute,
//    'language' => 'ru',
        'options' => [
//            'value'=>date('d/m/Y'),

//        'showAnim' => 'slide', //'slide','fold','slideDown','fadeIn','blind','bounce','clip','drop'
            'format' => 'yyyy.mm.dd',
//        'showSecond'=>true,
            'autoclose' => 'true',
//        'showButtonPanel' => true,
        ],
        'htmlOptions' => [
//        'style' => 'width: 120px;',
            'class' => 'filter-date',
            'id' => uniqid('from')
        ],
    ]);
    $form->widget('zii.widgets.jui.CJuiDatePicker', [
        'model' => $model,
        'attribute' => $settings->getAttributeTo($attribute),
//    'language' => 'ru',
        'options' => [
            'format' => 'yyyy.mm.dd',
            'autoclose' => 'true',

        ],
        'htmlOptions' => [
            'class' => 'filter-date',
//        'style' => 'width: 120px;',
            'id' => uniqid('to')
        ],
    ]);?>
</div>