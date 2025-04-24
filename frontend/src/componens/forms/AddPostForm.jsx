import React, { useState } from "react";
import axios from "axios";
import { BACKEND_SERVER } from "../../config";

const AddPostForm = ({ onPostCreated }) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file)); //Show preview
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("text", text);
    formData.append("image", image);

    try {
      const res = await axios.post(`${BACKEND_SERVER}/api/posts/create/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      setText("");
      setImage(null);
      setPreview(null);
      if (onPostCreated) onPostCreated(res.data);
    } catch (error) {
      console.error("Error when creating post:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Create post</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="mb-3"
      />

      {preview && (
        <div className="mb-3">
          <img src={preview} alt="preview" className="w-full rounded" />
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Text to the post..."
        className="w-full p-2 border rounded mb-3"
      />

      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Create post
      </button>
    </form>
  );
};

export default AddPostForm;
