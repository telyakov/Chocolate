<?

namespace Chocolate\HTML\Traits;


use FrameWork\DataBase\RecordsetRow;
use FrameWork\DataForm\DataFormModel\ColumnProperties;
use FrameWork\DataForm\DataFormModel\DataFormModel;

trait SelectGetSource
{

    public function getSource(ColumnProperties $columnProperties, DataFormModel $model = null)
    {
        $result = [];
        try {
            $recordset = $columnProperties->executeReadProc($model);
        } catch (\Exception $e) {
            return [];
        }
        if ($recordset && $count = $recordset->count()) {
            $data = $recordset->toRawArray();
            $idList = (new \SplFixedArray())->fromArray(array_column($data, 'id'));
            $nameList = (new \SplFixedArray())->fromArray(array_column($data, 'name'));
            $i = 0;

            while ($i < $count) {
                $result[] = [
                    'text' => isset($nameList[$i]) ? $nameList[$i] : '',
                    'value' => $idList[$i],
                ];
                ++$i;
            }
        }
        return $result;
    }
} 