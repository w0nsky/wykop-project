import React, { useState } from 'react';
import axios from 'axios';

const PostCommentForm = ({ postId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('access');

    if (!token) {
      setError('Brak tokena autoryzacyjnego. Zaloguj się ponownie.');
      setLoading(false);
      return;
    }

    try {
      console.log("Dane wysyłane do API:", {
        content: content,
        post : postId,
      });

      const response = await axios.post(
        `http://localhost:8000/api/posts/${postId}/comments/`,
        {
          content: content,
          post: postId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setContent('');
      if (onCommentAdded) onCommentAdded(response.data);

    } catch (err) {
      console.error("Błąd podczas dodawania komentarza:", err);
      if (err.response) {
        console.error("Odpowiedź z serwera:", err.response.data);
      }
      setError('Nie udało się dodać komentarza.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mt-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 border rounded-md"
        placeholder="Dodaj komentarz..."
        required
      />
      {error && <p className="text-red-500">{error}</p>}
      <button
        type="submit"
        className={`mt-2 p-2 bg-blue-500 text-white rounded-md ${loading ? 'opacity-50' : ''}`}
        disabled={loading}
      >
        {loading ? 'Wysyłanie...' : 'Dodaj komentarz'}
      </button>
    </form>
  );
};

export default PostCommentForm;
