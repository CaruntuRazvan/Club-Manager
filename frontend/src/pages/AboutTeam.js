import React, { useState } from 'react';
import '../styles/AboutTeam.css';

const AboutTeam = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Funcție pentru a deschide imaginea într-un modal
  const openImageModal = (imageSrc) => {
    setSelectedImage(imageSrc);
  };

  // Funcție pentru a închide modalul
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Funcție pentru a închide modalul la clic pe overlay
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('image-modal-overlay')) {
      closeImageModal();
    }
  };
  
  return (
    <section className="team-section">
      <h2>Despre Echipa</h2>
      <div className="team-kits">
        <div className="kit-item">
          <img
            src="/images/kit/full_kit_home.png"
            alt="Kit Acasă"
            className="kit-image"
            onClick={() => openImageModal('/images/kit/full_kit_home.png')}
          />
          <p>Home Kit</p>
        </div>
        <div className="kit-item">
          <img
            src="/images/kit/full_kit_away.png"
            alt="Kit Deplasare"
            className="kit-image"
            onClick={() => openImageModal('/images/kit/full_kit_away.png')}
          />
          <p>Away Kit</p>
        </div>
        <div className="kit-item">
          <img
            src="/images/kit/goalkeeper_kit_long.png"
            alt="Kit Portar"
            className="kit-image"
            onClick={() => openImageModal('/images/kit/goalkeeper_kit_long.png')}
          />
          <p>Goalkeeper Kit</p>
        </div>
      </div>

      {/* Modal pentru imaginea mărită */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={handleOverlayClick}>
          <div className="image-modal-content">
            <button className="image-modal-close-btn" onClick={closeImageModal}>
              X
            </button>
            <img src={selectedImage} alt="Imagine mărită" className="enlarged-image" />
          </div>
        </div>
      )}

      <div className="team-news">
        <h4>Noutăți despre Echipă</h4>
        <div className="news-item">
          <h5>Antrenament intensiv pentru meciul următor</h5>
          <p>Echipa a avut un antrenament intensiv ieri pentru a se pregăti pentru meciul împotriva FC Steaua București. Jucătorii sunt în formă maximă!</p>
          <span className="news-date">1 Martie 2025</span>
        </div>
        <div className="news-item">
          <h5>Transfer nou în echipă</h5>
          <p>Am semnat un contract cu un nou atacant, care va debuta în următorul meci. Bine ai venit în echipă!</p>
          <span className="news-date">28 Februarie 2025</span>
        </div>
      </div>
    </section>
  );
};

export default AboutTeam;