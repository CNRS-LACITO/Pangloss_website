<div class="view">

	<?php echo GxHtml::encode($data->getAttributeLabel('giix')); ?>:
	<?php echo GxHtml::link(GxHtml::encode($data->giix), array('view', 'id' => $data->giix)); ?>
	<br />

	<?php echo GxHtml::encode($data->getAttributeLabel('id')); ?>:
		<?php echo GxHtml::encode(GxHtml::valueEx($data->id0)); ?>
	<br />
	<?php echo GxHtml::encode($data->getAttributeLabel('language')); ?>:
	<?php echo GxHtml::encode($data->language); ?>
	<br />
	<?php echo GxHtml::encode($data->getAttributeLabel('translation')); ?>:
	<?php echo GxHtml::encode($data->translation); ?>
	<br />

</div>