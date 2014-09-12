<?
use Chocolate\HTML\ChHtml;
use Chocolate\HTML\Grid\Settings\XEditableSettings;
use FrameWork\DataForm\DataFormModel\DataFormModel;

/**
 * @var $this ChFileUpload
 * @var $controller CController
 */
?>
<? $isNewRow = DataFormModel::isNewRow($this->htmlOptions['data-parent-pk2']); ?>

    <section class="section-header" data-id="header">
        <div class="top-header">
            <div class="left-header">
                <span class="fa-paperclip"></span>
            </div>
            <div class="right-header">
                <? if ($isNewRow): ?>
                    <b>Сохраните строку, перед добавлением вложения</b>
                <? else: ?>
                    <b>Прикрепить файл</b> можно простым способом:
                    <li>
                        <b>Перенести файл мышкой</b> в область этой страницы
                    </li>
                    <li>
                        <b>Нажать</b> кнопку <b>сохранить</b>.
                    </li>
                <? endif; ?>
            </div>
        </div>
    </section>
    <section class="section-grid" data-id="grid-form">
        <? echo CHtml::beginForm($this->url, 'post', $this->htmlOptions); ?>
        <? if (!$isNewRow): ?>
            <div class="fileupload-buttonbar">
                <menu class="menu" type="toolbar">
                    <span class="fileinput-button menu-button active">
                        <span class="fa-plus-circle"></span>
                         <span> Вложить</span>
                        <?
                        echo CHtml::fileField($name, $this->value, ['id' => ChHtml::generateUniqueID('ff')]);
                        ?>
                    </span>
                    <!--        Class="start" Обязательная опция, по которой осуществляется загрузка всех файлов. Не удалять!-->
                    <button class="menu-button menu-button-save start" type="submit"
                            data-url="<? echo Yii::app()->createUrl('attachment/save') ?>">
                        <span class="fa-save"></span>
                        <span title="Сохранить">Сохранить</span>
                    </button>
                    <button class="menu-button active menu-button-refresh"
                            type="button">
                        <span class="fa-refresh" title="Обновить"></span>
                        <span title="Обновить">Обновить</span>
                    </button>

                    <div class="messages-container"></div>
                </menu>
            </div>
        <? endif; ?>
        <section data-id="grid">
            <div class=" grid-view" data-id="user-grid"
                 id="<? echo ChHtml::generateUniqueID('gv') ?>">
                <table class="items table-bordered" tabindex="0">
                    <thead>
                    <th data-id="chocolate-control-column">
                        <div></div>
                    </th>
                    <th data-id="name">
                        <div><a>
                                <?php echo XEditableSettings::getHeaderHtml('Скачать') ?>
                            </a></div>
                    </th>
                    <th data-id="version">
                        <div>
                            <a>
                                <?php echo XEditableSettings::getHeaderHtml('Версия') ?>
                            </a>
                        </div>
                    </th>
                    <th data-id="insusername">
                        <div>
                            <a>
                                <?php echo XEditableSettings::getHeaderHtml('Создатель') ?>
                            </a>

                    </th>
                    <th data-id="insdata">
                        <div>
                            <a>
                                <?php echo XEditableSettings::getHeaderHtml('Дата создания') ?>
                            </a>

                    </th>
                    </thead>
                    <!--                Не удалять class=files необходим для работы добавления файлов-->
                    <tbody class="files"></tbody>
                    <?php
                    $this->registerClientScript($htmlOptions['id']);
                    ?>
                </table>
            </div>
        </section>
        <?php echo CHtml::endForm(); ?>
        <?php Yii::app()->controller->renderPartial('//grid/_footer') ?>
    </section>

<? $id = $this->htmlOptions['id'];
Yii::app()->clientScript->registerScript(
    uniqid(), <<<JS
chApp.namespace('attachments').initData('$id', '$isNewRow');
JS
    , CClientScript::POS_READY
);
?>