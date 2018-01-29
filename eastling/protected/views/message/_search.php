<div class="wide form">

<?php $form = $this->beginWidget('GxActiveForm', array(
	'action' => Yii::app()->createUrl($this->route),
	'method' => 'get',
)); ?>

	<div class="row">
		<?php echo $form->label($model, 'giix'); ?>
		<?php echo $form->textField($model, 'giix'); ?>
	</div>

	<div class="row">
		<?php echo $form->label($model, 'id'); ?>
		<?php echo $form->dropDownList($model, 'id', GxHtml::listDataEx(SourceMessage::model()->findAllAttributes(null, true)), array('prompt' => Yii::t('app', 'All'))); ?>
	</div>

	<div class="row">
		<?php echo $form->label($model, 'language'); ?>
		<?php echo $form->textField($model, 'language', array('maxlength' => 16)); ?>
	</div>

	<div class="row">
		<?php echo $form->label($model, 'translation'); ?>
		<?php echo $form->textArea($model, 'translation'); ?>
	</div>

	<div class="row buttons">
		<?php echo GxHtml::submitButton(Yii::t('app', 'Search')); ?>
	</div>

<?php $this->endWidget(); ?>

</div><!-- search-form -->
