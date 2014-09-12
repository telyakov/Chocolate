<?php
/**
 * CDropDownMenu class file.
 *
 * @author Corey Tisdale <corey@eyewantmedia.com>
 * @link http://www.yiiframework.com/
 * @license MIT License
 */

/**
 * EScrollableGridView is an extension to CGridView that supports fixed headers and footers
 * for large datasets by tying in the jquery scrollable table plugin found here
 * http://www.farinspace.com/jquery-scrollable-table-plugin/
 * 
 * Please note -- this turns of ajax sorting, and will turn all gridview tables on the page
 * into scrollable tables. CGridView does not gave each table a distinct id so targeting
 * specific tables doesn't work.
 */

Yii::import('zii.widgets.grid.CGridView');

class EScrollableGridView extends CGridView
{
	/**
	 * @var int The desired height of the table in px.
	 */
	public $height;

	/**
	 * @var int The desired width of the table in px.
	 */	
	public $width;
	
	/**
	 * @var bool flush whether or not you would like the header/footer on the table to be flush with the bar.
	 */	
	public $flush;


	/**
	 * Calls the parent init function and sets variable defaults if they haven't already been set
	 */
	public function init() {
		
		//Only set defaults if we don't have anything set yet
		if(empty($this->height)) { $this->height = 100; }
		if(empty($this->width)) { $this->width = 'null'; }
		
		//Attempt to turn any true statement into the text "true" to pass to javascript
		$this->flush = ( strtolower($this->flush) == 'true' || $this->flush ) ? 'true' : 'false';
		
		//Does not work with ajax, turning off	
		$this->ajaxUpdate = false;
				
		parent::init();
	}
	
	
	/**
	 * Calls the parent registerClientScript, then registers the required client scripts
	 */
	public function registerClientScript() {
		parent::registerClientScript();
		$basePath = $basePath=dirname(__FILE__).DIRECTORY_SEPARATOR.'assets';
		$baseUrl = Yii::app()->getAssetManager()->publish($basePath);
		Yii::app()->clientScript->registerCoreScript('jquery');
		Yii::app()->clientScript->registerScriptFile($baseUrl . '/' . 'jquery.tablescroll.js',CClientScript::POS_HEAD);
		Yii::app()->clientScript->registerScript(
			'tablescrollactivate',
			'$(".' . $this->itemsCssClass . '").tableScroll({height:' . $this->height . ',width:' . $this->width . ',flush:' . $this->flush . '});',
			CClientScript::POS_READY
		);
	}
}
