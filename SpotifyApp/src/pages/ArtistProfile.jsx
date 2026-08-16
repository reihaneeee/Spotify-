import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/home/Sidebar';
import ArtistHeader from '../components/artist/ArtistHeader';
import ArtistStats from '../components/artist/ArtistStats';
import ArtistDiscography from '../components/artist/ArtistDiscography';
import { getCurrentUser } from '../utils/auth';
import { fetchArtist, fetchAlbums, fetchSongs, followArtistApi, unfollowArtistApi, getFullMediaUrl } from '../services/catalogApi';
import '../styles/artist.css';

export default function ArtistProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const user = getCurrentUser();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadArtistData() {
      setLoading(true);
      try {
        const [artistData, albumsData, songsData] = await Promise.all([
          fetchArtist(id),
          fetchAlbums({ artist: id }),
          fetchSongs({ artist: id })
        ]);

        if (!isMounted) return;

        // استخراج نام واقعی هنرمند به جای نمایش ID
        const displayName = artistData.artist_name || artistData.public_name || artistData.display_name || artistData.username || `Artist #${id}`;
        
        const formattedArtist = {
          ...artistData,
          id: artistData.id,
          name: displayName,
          avatar: getFullMediaUrl(artistData.avatar),
          verified: artistData.is_verified_artist ?? (artistData.role === 'artist' && artistData.artist_status === 'approved'),
          bio: artistData.bio || '',
          listeners: artistData.monthly_listeners || 0,
          streams: artistData.total_streams || 0,
          albums: Array.isArray(albumsData) ? albumsData : (albumsData.results || []),
          singles: Array.isArray(songsData) ? songsData : (songsData.results || [])
        };

        setArtist(formattedArtist);
        setFollowing(Boolean(artistData.is_following));
      } catch (err) {
        console.error("خطا در دریافت اطلاعات هنرمند از بک‌اند:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (id) {
      loadArtistData();
    }
    return () => { isMounted = false; };
  }, [id]);

  const handleFollowToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const prevStatus = following;
    setFollowing(!prevStatus);

    try {
      if (prevStatus) {
        await unfollowArtistApi(id);
      } else {
        await followArtistApi(id);
      }
    } catch (err) {
      console.error("خطا در تغییر وضعیت Follow:", err);
      setFollowing(prevStatus); // بازگرداندن وضعیت قبلی در صورت بروز خطا
    }
  };

  if (loading) {
    return (
      <div className="home-layout">
        <Sidebar />
        <main className="artist-page" style={{ padding: '40px', color: '#fff' }}>
          در حال بارگذاری اطلاعات هنرمند...
        </main>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="home-layout">
        <Sidebar />
        <main className="artist-page" style={{ padding: '40px', color: '#fff' }}>
          هنرمند مورد نظر یافت نشد.
        </main>
      </div>
    );
  }

  const isGold = user?.subscription === 'gold';

  return (
    <div className="home-layout">
      <Sidebar />
      <main className="artist-page">
        <ArtistHeader
          artist={artist}
          following={following}
          onFollowToggle={handleFollowToggle}
        />

        {isGold && <ArtistStats artist={artist} />}

        <ArtistDiscography artist={artist} />
      </main>
    </div>
  );
}