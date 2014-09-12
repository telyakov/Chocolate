<?php
/**
 * @var $form TbActiveForm
 * @var $model User
 */
?>
<header>
    <div>
        <div>
            <a>Шоколад</a> <i class="icon-ellipsis-vertical"></i>
        </div>
    </div>
</header>
<div class="form">
<?php
$form = $this->beginWidget('Chocolate.Widgets.ChActiveForm', array(
    'id' => 'forgot-password-form',
    'type' => 'horizontal',
    'enableClientValidation' => true,
    'htmlOptions' => [],
    'clientOptions' => []
)); ?>
    <div class="title">Восстановление пароля</div>
    <?php if ($model->hasErrors()): ?>
        <div class='error-banner'>

            <i class="icon-warning-sign"></i>
            <?php echo $form->error($model, 'email', array('class' => 'error')); ?>
        </div>
    <?php elseif( Yii::app()->user->hasFlash('success')): ?>
    <div class='success-banner'><i class="icon-check-sign"></i>
        <span class="success">
        <? echo Yii::app()->user->getFlash('success'); ?>
        </span>
    </div>

    <? endif; ?>
    <div class="separator"></div>
<?
echo $form->label($model, 'email');
echo $form->emailField($model,'email', ['value'=>'yourname@78stroy.ru', 'placeholder' => 'yourname@78stroy.ru']);
?>
    <?php echo CHtml::openTag('a', array(
            'href' => Yii::app()->createUrl('site/login'),
            'data-id' => 'forgot-password'

        )
    );
    echo 'На главную', CHtml::closeTag('a');
    ?>
    <div class="form-actions">
        <?php echo CHtml::submitButton('Выслать') ?>
    </div>
<?php $this->endWidget(); ?>
</div><!-- form -->
