<?php
Yii::import('bootstrap.widgets.TbMenu');
class ChMenu  extends TbMenu{

    protected function renderMenuItem($item)
    {
        if (isset($item['icon'])) {
            if (strpos($item['icon'], 'icon') === false) {
                $pieces = explode(' ', $item['icon']);
                $item['icon'] = 'icon-' . implode(' icon-', $pieces);
            }

            $item['label'] = '<i class="' . $item['icon'] . '"></i> ' . $item['label'];
        }

        if (!isset($item['linkOptions'])) {
            $item['linkOptions'] = array();
        }

        if (isset($item['items']) && !empty($item['items'])) {
            if (empty($item['url'])) {
                $item['url'] = '#';
            }

            if (isset($item['linkOptions']['class'])) {
                $item['linkOptions']['class'] .= ' dropdown-toggle';
            } else {
                $item['linkOptions']['class'] = 'dropdown-toggle';
            }

            $item['linkOptions']['data-toggle'] = 'dropdown';
            $item['linkOptions']['tabindex'] = '-1';
            $item['label'] .= ' <span class="caret"></span>';
        }

        if (isset($item['url'])) {
            return CHtml::link($item['label'], $item['url'], $item['linkOptions']);
        } else {
            return $item['label'];
        }
    }
}