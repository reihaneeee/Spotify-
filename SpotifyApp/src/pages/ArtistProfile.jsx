import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/home/Sidebar';
import ArtistHeader from '../components/artist/ArtistHeader';
import ArtistStats from '../components/artist/ArtistStats';
import ArtistDiscography from '../components/artist/ArtistDiscography';
import { getCurrentUser } from '../utils/auth';
import { getArtistById, followArtist, unfollowArtist, isFollowing } from '../utils/mockData';
import '../styles/artist.css';

export default function ArtistProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useMemo(() => getCurrentUser(), []);
  

  // محاسبه artist از id بدون useEffect
  const artist = useMemo(() => {
    const artistData = getArtistById(id);
    if (!artistData) {
      navigate('/home');
      return null;
    }
    return artistData;
  }, [id, navigate]);

  // following state رو با lazy initializer بده
  const [following, setFollowing] = useState(() => {
    if (!user || !artist) return false;
    return isFollowing(user.username, artist.id);
  });

  if (!artist) return null;

  const handleFollowToggle = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (following) {
      unfollowArtist(user.username, artist.id);
      setFollowing(false);
    } else {
      followArtist(user.username, artist.id);
      setFollowing(true);
    }
  };

  const isGold = user?.subscription === 'gold';

  return (
    <div className="app-layout">
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
