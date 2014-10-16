<?

namespace Chocolate\HTML\Traits;


use FrameWork\DataForm\DataFormModel\ColumnProperties;
use FrameWork\DataForm\DataFormModel\DataFormModel;

trait Select2GetSource
{

    public function getSource(ColumnProperties $columnProperties, DataFormModel $model = null)
    {
        $result = [];
        try {
            $recordset = $columnProperties->executeReadProc($model);
        } catch (\Exception $e) {
            return [];
        }
        if ($recordset && ($count = $recordset->count())) {
            $data = $recordset->toRawArray();
            $idList = (new \SplFixedArray())->fromArray(array_column($data, 'id'));
            $nameList = (new \SplFixedArray())->fromArray(array_column($data, 'name'));
            $descList = (new \SplFixedArray())->fromArray(array_column($data, 'description'));
            $i = 0;

            while ($i < $count) {
                $result[] = [
                    'text' => isset($nameList[$i]) ? $nameList[$i] : '',
                    'id' => $idList[$i],
                    'description' => isset($descList[$i]) ? $descList[$i] : ''
                ];
                ++$i;
            }
        }

        return $result;
    }
} 