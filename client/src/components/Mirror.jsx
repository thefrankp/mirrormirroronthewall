import React, { useEffect, useRef, useState } from 'react';

export default function Mirror() {
  const videoRef = useRef(null);
  const [datetime, setDatetime] = useState(null);
  const [mirrored, setMirrored] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('Camera error:', err);
      });

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    function fetchDatetime() {
      fetch('/api/datetime')
        .then((res) => res.json())
        .then((data) => setDatetime(data.datetime))
        .catch((err) => console.error('Datetime fetch error:', err));
    }

    fetchDatetime();
    const interval = setInterval(fetchDatetime, 60_000);
    return () => clearInterval(interval);
  }, []);

  function formatDatetime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString();
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: mirrored ? 'scaleX(-1)' : 'none',
        }}
      />
      <button
        onClick={() => setMirrored((m) => !m)}
        title={mirrored ? 'Disable mirror' : 'Enable mirror'}
        style={{
          position: 'absolute',
          bottom: '32px',
          right: '32px',
          background: 'rgba(0, 0, 0, 0.45)',
          border: 'none',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="24"
          height="24"
        >
          <polyline points="1 4 1 10 7 10" />
          <polyline points="23 20 23 14 17 14" />
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" />
        </svg>
      </button>
      {datetime && (
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#fff',
            fontSize: '18px',
            fontFamily: 'monospace',
            background: 'rgba(0, 0, 0, 0.45)',
            padding: '6px 16px',
            borderRadius: '6px',
            pointerEvents: 'none',
          }}
        >
          {formatDatetime(datetime)}
        </div>
      )}
    </div>
  );
}
