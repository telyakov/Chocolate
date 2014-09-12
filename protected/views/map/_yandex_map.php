<?
/**
 * @var $model GridForm
 * @var $this CController
 */
?>
<?
$mapID = uniqid('map');
$recordset = $model->loadData();
$data = json_encode($recordset->rawUrlEncode());
?>

    <div class="map" id="<? echo $mapID ?>" style="width: 100%; height: 600px"></div>
<?
Yii::app()->clientScript->registerScript('yandex_map', <<<JS

jQuery.cachedScript = function( url, options ) {

  // Allow user to set any option except for dataType, cache, and url
  options = $.extend( options || {}, {
    dataType: "script",
    cache: true,
    url: url
  });
  return jQuery.ajax( options );
};
    $.cachedScript('/js/libs/yandex.map.js').done(
     function(){
      ymaps.ready(function(){
      var ch_map =ChObjectStorage.create($('#' + '$mapID'), 'ChMap');
         ch_map.init(ymaps, '$data');
  });
    } );
JS
    , CClientScript::POS_END
)
?>