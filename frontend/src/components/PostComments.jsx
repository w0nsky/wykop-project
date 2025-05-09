import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostCommentForm from './PostCommentForm';

const PostComments = ({ postId }) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      const response = await axios.get(`http://localhost:8000/api/posts/${postId}/comments/`);
      setComments(response.data);
    };
    fetchComments();
  }, [postId]);

  const handleCommentAdded = (newComment) => {
    setComments([newComment, ...comments]);
  };

  return (
    <div className="mt-4">
      <PostCommentForm postId={postId} onCommentAdded={handleCommentAdded} />
      <div className="mt-4">
        {comments.map((comment) => (
          <div key={comment.id} className="p-2 border-b text-gray-700">
            <h3 className="font-bold">{comment.user}</h3>
            <p className ="text-gray-700">{comment.content}</p>
            <span className="text-sm text-gray-500">{comment.created_at}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostComments;
