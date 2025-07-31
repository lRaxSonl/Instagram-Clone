import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { createPost } from "../../api/posts";
import "../../css/addPostForm.css";
import "react-toastify/dist/ReactToastify.css";

const AddPostForm = ({ isOpen, onClose, onPostCreated }) => {
  const [step, setStep] = useState(1);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedImage, setCroppedImage] = useState(null);
  const [filter, setFilter] = useState(null);
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Очистка URL при размонтировании
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Обработка выбора изображения
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Размер изображения должен быть менее 2 МБ");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Пожалуйста, загрузите изображение");
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setStep(2);
    }
  };

  // Обрезка изображения
  const onCropComplete = useCallback(
    async (croppedArea, croppedAreaPixels) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = preview;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      canvas.toBlob((blob) => {
        setCroppedImage(blob);
      }, "image/jpeg", 0.9);
    },
    [preview]
  );

  // Отправка поста
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!croppedImage && !text.trim()) {
      toast.error("Добавьте изображение или текст");
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("text", text.trim());
      
      if (croppedImage) {
        formData.append("image", croppedImage, "post.jpg");
      }
      
      if (tags.trim()) {
        formData.append("tags", tags.trim());
      }
      
      if (location.trim()) {
        formData.append("location", location.trim());
      }

      const res = await createPost(formData);
      toast.success("Пост успешно опубликован!");
      
      // Сброс состояния
      setText("");
      setImage(null);
      setPreview(null);
      setCroppedImage(null);
      setTags("");
      setLocation("");
      setFilter(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setStep(1);
      
      if (onPostCreated) {
        onPostCreated(res.data);
      }
      
      onClose();
      
    } catch (error) {
      console.error("Ошибка при создании поста:", error);
      const errorMsg = error.response?.data?.details || "Не удалось опубликовать пост. Попробуйте снова.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Отмена создания поста
  const handleCancel = () => {
    if (isLoading) return;
    
    if (step === 1) {
      onClose();
    } else if (step === 2) {
      setStep(1);
      setImage(null);
      setPreview(null);
    } else if (step === 3) {
      setStep(2);
    }
  };

  // Список доступных фильтров
  const filters = [
    { name: "Обычный", value: null, preview: "none" },
    { name: "Сепия", value: "sepia", preview: "sepia(1)" },
    { name: "Ч/Б", value: "grayscale", preview: "grayscale(1)" },
    { name: "Винтаж", value: "vintage", preview: "contrast(1.2) brightness(0.8) sepia(0.3)" },
    { name: "Ясность", value: "clarity", preview: "contrast(1.1) saturate(1.2)" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="add-post-overlay"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="add-post-modal"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок модального окна */}
            <div className="add-post-header">
              <button 
                className="add-post-back-btn"
                onClick={handleCancel}
                disabled={isLoading}
              >
                {step === 1 ? "Отмена" : "Назад"}
              </button>
              
              <h3 className="add-post-title">
                {step === 1 ? "Новый пост" : step === 2 ? "Обрезка" : "Редактирование"}
              </h3>
              
              <button 
                className="add-post-close-btn"
                onClick={onClose}
                disabled={isLoading}
              >
                ×
              </button>
            </div>

            {/* Контент формы */}
            <div className="add-post-content">
              {step === 1 && (
                <div className="add-post-step1">
                  <div className="add-post-upload-area">
                    <label htmlFor="image-upload" className="upload-label">
                      <div className="upload-icon">📷</div>
                      <div className="upload-text">Выберите фото</div>
                      <div className="upload-subtext">или перетащите сюда</div>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="image-upload-input"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {step === 2 && preview && (
                <div className="add-post-step2">
                  <div className="crop-container">
                    <Cropper
                      image={preview}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      showGrid={true}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </div>
                  
                  <div className="crop-controls">
                    <label>Увеличение:</label>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <button
                    className="add-post-next-btn"
                    onClick={() => setStep(3)}
                    disabled={isLoading}
                  >
                    Далее
                  </button>
                </div>
              )}

              {step === 3 && (
                <form onSubmit={handleSubmit} className="add-post-step3">
                  {/* Превью поста */}
                  <div className="post-preview-container">
                    <div 
                      className="post-preview"
                      style={{
                        backgroundImage: preview ? `url(${preview})` : 'none',
                        filter: filters.find(f => f.value === filter)?.preview || 'none'
                      }}
                    />
                  </div>

                  {/* Фильтры */}
                  <div className="filters-section">
                    <h4>Фильтры</h4>
                    <div className="filters-list">
                      {filters.map((f) => (
                        <div
                          key={f.value || 'normal'}
                          className={`filter-item ${filter === f.value ? 'active' : ''}`}
                          style={{
                            backgroundImage: preview ? `url(${preview})` : 'none',
                            filter: f.preview
                          }}
                          onClick={() => setFilter(f.value)}
                        >
                          <span className="filter-name">{f.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Форма публикации */}
                  <div className="post-form">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Напишите подпись..."
                      className="post-caption"
                      rows="3"
                      disabled={isLoading}
                    />
                    
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="#теги #через #решетку"
                      className="post-tags"
                      disabled={isLoading}
                    />
                    
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="📍 Местоположение"
                      className="post-location"
                      disabled={isLoading}
                    />

                    <button
                      type="submit"
                      className="post-share-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="loading-spinner">•••</span>
                      ) : (
                        "Опубликовать"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>

          <ToastContainer 
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default AddPostForm;