<?php
/**
 * @var $this SiteController
 * @var $model LoginForm
 */
$this->pageTitle = Yii::app()->name;
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
    /**
     * @see http://yiibooster.clevertech.biz/widgets/forms/view/activeform.html
     * @var $form TbActiveForm
     */
    $form = $this->beginWidget('booster.widgets.TbActiveForm', [
        'id' => 'login-form',
        'type' => 'horizontal',
        'enableClientValidation' => false,
        'htmlOptions' => [],
        'clientOptions' => [],
    ]); ?>

    <div class="title">Войти</div>
    <?php if ($model->hasErrors()): ?>
        <div class='error-banner'><i class="icon-warning-sign"></i>
            <?php echo $form->error($model, 'error', array('class' => 'error')); ?>
        </div>
    <?php endif ?>
    <div class="separator"></div>
    <?php echo $form->textFieldGroup($model, 'username'); ?>
    <?php echo $form->passwordFieldGroup($model, 'password', array('class' => 'span3')); ?>

    <?php echo CHtml::openTag('a', array(
            'href' => Yii::app()->createUrl('site/forgotPassword'),
            'title' => 'Забыли пароль?',
            'data-id' => 'forgot-password'
        )
    );
    echo 'Забыли пароль?';
    echo CHtml::closeTag('a')?>

    <div class="form-actions">
        <?php echo CHtml::submitButton('Войти') ?>
    </div>

    <?php $this->endWidget(); ?>
</div><!-- form -->