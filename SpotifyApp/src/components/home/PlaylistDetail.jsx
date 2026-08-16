// src/components/home/PlaylistDetail.jsx
//
// Phase-1 part 2.7 synced to the phase-2 backend. Tracks, search results and
// rename/remove/add actions all go through playlistApi.js + catalogApi.js
// now instead of the 'playlists' localStorage array. One behavioural change:
// the backend's Playlist model only ever stores individual songs (matching
// spec 2.7's "add songs to a playlist" wording), so "add whole album" now
// adds every track of that album individually instead of storing a nested
// album blob inside the playlist -- the old "expand this album inside the
// playlist" UI is replaced by a flat, always-up-to-date track list.
import React, { useState, useEffect, useCallback } from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import { fetchSongs, fetchAlbum, fetchAlbums } from '../../services/catalogApi';
import {
  fetchPlaylist,
  renamePlaylist,
  removeTrackFromPlaylist,
  addTrackToPlaylist,
  addAlbumToPlaylist,
} from '../../services/playlistApi';
import { Music, ArrowLeft, Minus } from 'lucide-react';

export default function PlaylistDetail({ playlist, onBack }) {
  const { playSong } = usePlayback();
  const [detail, setDetail] = useState(playlist);
  const [trackSearch, setTrackSearch] = useState('');
  const [albumSearch, setAlbumSearch] = useState('');
  const [searchedTracks, setSearchedTracks] = useState([]);
  const [searchedAlbums, setSearchedAlbums] = useState([]);

  const [isEditingName, setIsEditingName] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState(playlist.title || '');

  const reload = useCallback(async () => {
    const fresh = await fetchPlaylist(playlist.id);
    setDetail(fresh);
    setPlaylistTitle(fresh.title);
  }, [playlist.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!trackSearch) { setSearchedTracks([]); return; }
    const handle = setTimeout(() => {
      fetchSongs({ search: trackSearch }).then(setSearchedTracks);
    }, 250);
    return () => clearTimeout(handle);
  }, [trackSearch]);

  useEffect(() => {
    if (!albumSearch) { setSearchedAlbums([]); return; }
    const handle = setTimeout(() => {
      fetchAlbums({ search: albumSearch }).then(setSearchedAlbums);
    }, 250);
    return () => clearTimeout(handle);
  }, [albumSearch]);

  const handleRenamePlaylist = async () => {
    if (!playlistTitle.trim() || playlistTitle.trim() === detail.title) {
      setIsEditingName(false);
      return;
    }
    const updated = await renamePlaylist(playlist.id, playlistTitle.trim());
    setDetail((prev) => ({ ...prev, title: updated.title }));
    setIsEditingName(false);
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleRenamePlaylist(); }
    else if (e.key === 'Escape') { setPlaylistTitle(detail.title); setIsEditingName(false); }
  };

  const handleRemoveTrackFromPlaylist = async (songId) => {
    await removeTrackFromPlaylist(playlist.id, songId);
    setDetail((prev) => ({ ...prev, songs: prev.songs.filter((s) => s.id !== songId) }));
  };

  const handleAddTrack = async (song) => {
    if (detail.songs?.some((s) => s.id === song.id)) {
      alert('This track is already in this playlist!');
      return;
    }
    await addTrackToPlaylist(playlist.id, song.id);
    setDetail((prev) => ({ ...prev, songs: [...prev.songs, song] }));
    setTrackSearch('');
  };

  const handleAddAlbum = async (album) => {
    const fullAlbum = await fetchAlbum(album.id);
    const newTracks = (fullAlbum.tracks || []).filter((t) => !detail.songs?.some((s) => s.id === t.id));
    if (newTracks.length === 0) {
      alert('All tracks from this album are already in this playlist!');
      return;
    }
    await addAlbumToPlaylist(playlist.id, newTracks.map((t) => t.id));
    setDetail((prev) => ({ ...prev, songs: [...prev.songs, ...newTracks] }));
    setAlbumSearch('');
    alert('Added album tracks to playlist successfully!');
  };

  const currentSongsList = detail.songs || [];

  return (
    <div style={{ color: '#fff', direction: 'ltr', fontFamily: 'sans-serif', textAlign: 'left', padding: '0 32px 40px 32px', boxSizing: 'border-box' }}>

      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#242424', color: '#fff', border: '1px solid #3e3e3e', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', marginTop: '16px', marginBottom: '24px', fontWeight: 'bold', fontSize: '11px' }}>
        <ArrowLeft size={13} /> Back to Playlists
      </button>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '30px' }}>
        <img src={detail.cover_image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 24 24' fill='%23282828'%3E%3Crect width='100%25' height='100%25' fill='%23282828'/%3E%3C/svg%3E"} alt="" style={{ width: '150px', height: '150px', borderRadius: '8px', objectFit: 'cover' }} />
        <div>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1db954' }}>PLAYLIST</span>
          <div style={{ margin: '8px 0' }}>
            {isEditingName ? (
              <input
                type="text" value={playlistTitle} onChange={(e) => setPlaylistTitle(e.target.value)}
                onKeyDown={handleRenameKeyDown} onBlur={handleRenamePlaylist} autoFocus
                style={{ backgroundColor: '#242424', border: '2px solid #1db954', borderRadius: '6px', color: '#fff', fontSize: '32px', fontWeight: '800', padding: '4px 12px', outline: 'none', fontFamily: 'sans-serif', width: '100%', maxWidth: '400px' }}
              />
            ) : (
              <h2 onClick={() => setIsEditingName(true)} title="Click to rename" style={{ fontSize: '32px', margin: 0, fontWeight: '800', cursor: 'pointer', display: 'inline-block', borderBottom: '1px dashed transparent', transition: 'border-color 0.2s' }}
                onMouseOver={(e) => (e.currentTarget.style.borderBottomColor = '#1db954')}
                onMouseOut={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
              >
                {playlistTitle}
              </h2>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '320px', backgroundColor: '#121212', padding: '24px', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Tracks</h3>
          {currentSongsList.length === 0 ? (
            <p style={{ color: '#b3b3b3', textAlign: 'center', padding: '20px' }}>This playlist is empty.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentSongsList.map((item, idx) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#181818', borderRadius: '8px', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', transition: 'background-color 0.25s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#222222')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#181818')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, overflow: 'hidden' }}>
                    <span style={{ color: '#a7a7a7', width: '20px', fontWeight: 'bold', fontSize: '14px' }}>{idx + 1}</span>
                    <div style={{ width: '46px', height: '46px', borderRadius: '4px', backgroundColor: '#282828', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                      {item.cover_image ? <img src={item.cover_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Music size={20} style={{ color: '#535353' }} />}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left', overflow: 'hidden' }}>
                      <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</h5>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', color: '#b3b3b3' }}>{item.artist_detail?.public_name}</span>
                        {item.album_title && <span style={{ fontSize: '11px', color: '#1db954' }}>• 💿 {item.album_title}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <button
                      onClick={() => playSong({ ...item, src: item.audio_file }, currentSongsList.filter((t) => t.id !== item.id).map((t) => ({ ...t, src: t.audio_file })))}
                      style={{ backgroundColor: '#1db954', border: 'none', color: '#fff', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                    >
                      Play
                    </button>
                    <button onClick={() => handleRemoveTrackFromPlaylist(item.id)} style={{ backgroundColor: '#282828', border: '1px solid #3e3e3e', color: '#b3b3b3', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}>
                      <Minus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: '#121212', padding: '20px', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px' }}>Search & Add Track</h4>
            <input type="text" placeholder="🔍 Track title..." value={trackSearch} onChange={(e) => setTrackSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', backgroundColor: '#242424', border: '1px solid #3e3e3e', borderRadius: '6px', color: '#fff', fontSize: '13px', outline: 'none' }}
            />
            {searchedTracks.length > 0 && (
              <div style={{ backgroundColor: '#181818', borderRadius: '6px', marginTop: '8px', maxHeight: '150px', overflowY: 'auto', border: '1px solid #282828' }}>
                {searchedTracks.map((t) => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #242424' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px', textAlign: 'left' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', display: 'block' }}>{t.title}</span>
                      <span style={{ fontSize: '11px', color: '#b3b3b3' }}>{t.artist_detail?.public_name}</span>
                    </div>
                    <button onClick={() => handleAddTrack(t)} style={{ backgroundColor: '#1db954', border: 'none', color: '#fff', fontSize: '11px', padding: '4px 10px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Add</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ backgroundColor: '#121212', padding: '20px', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px' }}>Search & Add Album (all tracks)</h4>
            <input type="text" placeholder="🔍 Album title..." value={albumSearch} onChange={(e) => setAlbumSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', backgroundColor: '#242424', border: '1px solid #3e3e3e', borderRadius: '6px', color: '#fff', fontSize: '13px', outline: 'none' }}
            />
            {searchedAlbums.length > 0 && (
              <div style={{ backgroundColor: '#181818', borderRadius: '6px', marginTop: '8px', maxHeight: '150px', overflowY: 'auto', border: '1px solid #282828' }}>
                {searchedAlbums.map((a) => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #242424' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px', textAlign: 'left' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', display: 'block' }}>{a.title}</span>
                      <span style={{ fontSize: '11px', color: '#b3b3b3' }}>By {a.artist_detail?.public_name}</span>
                    </div>
                    <button onClick={() => handleAddAlbum(a)} style={{ backgroundColor: '#1db954', border: 'none', color: '#fff', fontSize: '11px', padding: '4px 10px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Add</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
