<?php

class EastlingControllerTest extends CTestCase {
    

public function testApprove()
{
    // insert a comment in pending status
    $comment=new Comment;
    $comment->setAttributes(array(
        'content'=>'comment 1',
        'status'=>Comment::STATUS_PENDING,
        'createTime'=>time(),
        'author'=>'me',
        'email'=>'me@example.com',
        'postId'=>$this->posts['sample1']['id'],
    ),false);
    $this->assertTrue($comment->save(false));
 
    // verify the comment is in pending status
    $comment=Comment::model()->findByPk($comment->id);
    $this->assertTrue($comment instanceof Comment);
    $this->assertEquals(Comment::STATUS_PENDING,$comment->status);
 
    // call approve() and verify the comment is in approved status
    $comment->approve();
    $this->assertEquals(Comment::STATUS_APPROVED,$comment->status);
    $comment=Comment::model()->findByPk($comment->id);
    $this->assertEquals(Comment::STATUS_APPROVED,$comment->status);
}

}

?>