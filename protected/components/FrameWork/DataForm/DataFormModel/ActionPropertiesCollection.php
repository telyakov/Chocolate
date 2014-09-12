<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 14.06.13
 * Time: 11:40
 * To change this template use File | Settings | File Templates.
 */

namespace FrameWork\DataForm\DataFormModel;


use Rmk\Collection\ObjectMap;

class ActionPropertiesCollection extends ObjectMap
{

    public function __construct($from = null)
    {
        parent::__construct('\FrameWork\DataForm\DataFormModel\ActionProperties', $from);
    }

    public function getData()
    {

        $data = [];
        /**
         * @var $actionProperties ActionProperties
         */
        foreach ($this as $actionProperties) {
            $data[] = [
                'title' => rawurlencode($actionProperties->getCaption()),
                'cmd' => rawurlencode($actionProperties->getAction())
            ];

        }
        $data = array_merge($data, $this->getDefaultAction());
        return $data;
    }

    protected function getDefaultAction()
    {
        return [
            ['title' => rawurlencode('Экспорт в Excel'), 'cmd' => rawurlencode('ch.export2excel')],
            ['title' => rawurlencode('Настройка'), 'cmd' => rawurlencode('ch.settings')]
        ];
    }

}