<?php
/**
 * @var $this SiteController
 * @var $code int
 * @var $message string
 **/
$this->pageTitle = Yii::app()->name . ' :: Error ' . $code;
?>
<section class="error-container">

    <div class="error-header">
        <h2>Ошибка</h2>
    </div>
    <div class="separator"></div>


    <div class="error-body">
        <i class="icon-warning-sign"></i>
        Ошибка <?php echo $code; ?> : <?php echo $message ?>
    </div>

    <div class="separator"></div>

    <div class="error-help">
        <h2>Что делать?</h2>
        <ul>

        <li>
            1. Воспользуетесь <a href="<?php echo Yii::app()->createUrl('site/index') ?>">главной
                страницей</a>.
        </li>
        <li>
            2. Если вы уверены, что ошибка произошла не по вашей вине,
            сообщите <a href="mailto:<?php echo Yii::app()->params['adminEmail'] ?>">разработчикам</a>
            о возникшей ошибке.
        </li>
        </ul>
    </div>
</section>

