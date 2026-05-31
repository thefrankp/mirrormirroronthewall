import React, { useEffect, useRef, useState, useCallback } from 'react';

const SYMMETRY_MODES = ['none', 'left', 'right'];

const fullVideo = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  objectFit: 'cover',
};

const btn = {
  position: 'absolute',
  bottom: '32px',
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
  zIndex: 3,
};

export default function Mirror() {
  const videoRef = useRef(null);
  const video2Ref = useRef(null);
  const streamRef = useRef(null);
  const [datetime, setDatetime] = useState(null);
  const [mirrored, setMirrored] = useState(false);
  const [symmetryIndex, setSymmetryIndex] = useState(0);

  const symmetryMode = SYMMETRY_MODES[symmetryIndex];

  // Assign the live stream to a video element as soon as it mounts
  const makeVideoRef = useCallback((ref) => (node) => {
    ref.current = node;
    if (node && streamRef.current) node.srcObject = streamRef.current;
  }, []);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        if (video2Ref.current) video2Ref.current.srcObject = stream;
      })
      .catch((err) => console.error('Camera error:', err));

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
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

  // How clip-path + scaleX(-1) creates symmetry:
  //
  // Both <video> elements span the full viewport (100vw × 100vh).
  // clip-path crops each to its half IN ELEMENT COORDINATES (before transform).
  // scaleX(-1) around the default origin (50vw, i.e. the viewport centre) then
  // flips the clipped half ACROSS that centre line, landing it on the opposite side.
  //
  //   left mode:  v1 clips 0-50vw, no flip  → shows left half on left
  //               v2 clips 0-50vw, flip      → left half reflected onto right
  //   right mode: v1 clips 50-100vw, flip   → right half reflected onto left
  //               v2 clips 50-100vw, no flip → shows right half on right

  let v1Style, v2Style;

  if (symmetryMode === 'none') {
    v1Style = { ...fullVideo, transform: mirrored ? 'scaleX(-1)' : 'none' };
    v2Style = { ...fullVideo, visibility: 'hidden' };
  } else if (symmetryMode === 'left') {
    v1Style = { ...fullVideo, clipPath: 'inset(0 50% 0 0)' };
    v2Style = { ...fullVideo, clipPath: 'inset(0 50% 0 0)', transform: 'scaleX(-1)' };
  } else {
    v1Style = { ...fullVideo, clipPath: 'inset(0 0 0 50%)', transform: 'scaleX(-1)' };
    v2Style = { ...fullVideo, clipPath: 'inset(0 0 0 50%)' };
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <video ref={makeVideoRef(videoRef)} autoPlay playsInline muted style={v1Style} />
      <video ref={makeVideoRef(video2Ref)} autoPlay playsInline muted style={v2Style} />


      {/* Symmetry button — bottom left */}
      <button onClick={() => setSymmetryIndex((i) => (i + 1) % SYMMETRY_MODES.length)} style={{ ...btn, left: '32px' }}>
        <SymmetryIcon />
      </button>

      {/* Mirror flip button — bottom right */}
      <button onClick={() => setMirrored((m) => !m)} title={mirrored ? 'Disable mirror' : 'Enable mirror'} style={{ ...btn, right: '32px' }}>
        <FlipIcon />
      </button>

      {datetime && (
        <div style={{
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
          zIndex: 3,
        }}>
          {new Date(datetime).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
        </div>
      )}
    </div>
  );
}

function SymmetryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
      {/* vertical centre line */}
      <line x1="12" y1="3" x2="12" y2="21" />
      {/* left arrow */}
      <polyline points="5,9 2,12 5,15" />
      <line x1="2" y1="12" x2="11" y2="12" />
      {/* right arrow */}
      <polyline points="19,9 22,12 19,15" />
      <line x1="13" y1="12" x2="22" y2="12" />
    </svg>
  );
}

function FlipIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
      <polyline points="1 4 1 10 7 10" />
      <polyline points="23 20 23 14 17 14" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" />
    </svg>
  );
}
