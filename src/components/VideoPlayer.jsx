import React from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = ({ url, title, description }) => {
  return (
    <div className="video-card" style={{
      background: 'var(--surface-container-low)',
      borderRadius: 'var(--xl-radius)',
      overflow: 'hidden',
      border: '1px solid var(--outline-variant)',
      transition: 'var(--transition)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
        <ReactPlayer
          url={url}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          controls={true}
          light={false} // Se desactiva light para permitir que los archivos .mp4 directos de Firebase Storage carguen su reproductor nativo
        />
      </div>
      <div style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--on-surface)' }}>
          {title || 'Video de Tecnomarket'}
        </h3>
        {description && (
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
