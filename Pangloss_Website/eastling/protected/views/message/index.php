<div class="container">
    <div class="span12">

<?php

$this->breadcrumbs = array(
	Message::label(2),
	Yii::t('app', 'Index'),
);

$this->menu = array(
	array('label'=>Yii::t('app', 'Create') . ' ' . Message::label(), 'url' => array('create')),
	array('label'=>Yii::t('app', 'Manage') . ' ' . Message::label(2), 'url' => array('admin')),
);
?>

<h1><?php echo GxHtml::encode(Message::label(2)); ?></h1>

<?php $this->widget('zii.widgets.CListView', array(
	'dataProvider'=>$dataProvider,
	'itemView'=>'_view',
)); 