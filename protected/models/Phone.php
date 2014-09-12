<?

use \FrameWork\DataBase\DataBaseRoutine;
use \Chocolate\Http\Response;
class Phone {

    const CALL_ROUTINE = 'crm.makeCall';
     static function makeCall($phoneTo){
         $callRoutine = new DataBaseRoutine(
             self::CALL_ROUTINE,
             new \FrameWork\DataBase\DataBaseParameters([
                 'userID' => Yii::app()->user->id,
                 'phoneTo' => $phoneTo
             ])
         );
         $response = new Response();
         try{
            Yii::app()->erp->exec($callRoutine);
             $response->setStatus('', Response::SUCCESS);
         }catch (Exception $e){
             $response->setStatus($e->getMessage());
         }
         finally{
             return $response;
         }
     }

} 