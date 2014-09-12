<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 21.04.14
 * Time: 10:47
 */
use FrameWork\DataBase\RecordsetRow;
use FrameWork\DataForm\DataFormModel\ColumnProperties;
use FrameWork\DataForm\DataFormModel\GridColumnType;

class ExcelModel
{

    public static function export(GridForm $model, array $data, array $settings)
    {
        Yii::import('ext.phpexcel.XPHPExcel');
        $document = XPHPExcel::createPHPExcel();
        $document->setActiveSheetIndex(0);
        $title = $model->getDataFormProperties()->getWindowCaption();
        $activeSheet = $document->getActiveSheet();
        $activeSheet->setTitle($title);
//        $pColumn = 0;
        /**
         * @var $column ColumnProperties
         */
        foreach ($model->getColumnPropertyCollection() as $column) {
            if ($column->isVisible()) {
                $visibleKey = $column->getVisibleKey();
                foreach ($settings as $setting) {
                    if ($setting['key'] == $visibleKey) {
                        $pColumn = $setting['weight'] - 1;
                        $width = $setting['width'];
                        break;
                    }
                }
                $activeSheet->getColumnDimensionByColumn($pColumn)->setWidth($width / 8);
                $activeSheet->getStyleByColumnAndRow($pColumn, 1)->applyFromArray(array(
                    'font'  => array(
                        'size'  => 12,
                        'name'  => 'Verdana'
                    )));

                $activeSheet->setCellValueByColumnAndRow($pColumn, 1, $column->getVisibleCaption());
                $key = $column->getKey();
                $values = array_column($data, $key);
                $type = $column->getGridEditType();
                $isSelect = ($type == GridColumnType::ValueList) || ($type == GridColumnType::ValueListWithoutBlank);
                if ($isSelect) {
                    $recordset = $column->executeReadProc($model->getDataFormModel());
                }
                foreach ($values as $pRow => $value) {
                    if ($isSelect) {
                        /**
                         * @var $row RecordsetRow
                         */
                        foreach ($recordset as $row) {
                            if ($row->id == $value) {
                                $value = $row['name'];
                                break;
                            }
                        }
                    }
                    $activeSheet->setCellValueByColumnAndRow($pColumn, $pRow + 2, $value);
                }

//                ++$pColumn;


            }
        }

// Redirect output to a client?€™s web browser (Excel5)
        header('Content-Type: application/vnd.ms-excel');

        header('Content-Disposition: attachment;filename="' . rawurlencode($title) . '.xls"');
        header('Cache-Control: max-age=0');
// If you're serving to IE 9, then the following may be needed
        header('Cache-Control: max-age=1');

// If you're serving to IE over SSL, then the following may be needed
        header('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); // Date in the past
        header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT'); // always modified
        header('Cache-Control: cache, must-revalidate'); // HTTP/1.1
        header('Pragma: public'); // HTTP/1.0

        $objWriter = PHPExcel_IOFactory::createWriter($document, 'Excel5');
        $objWriter->save('php://output');
    }
} 