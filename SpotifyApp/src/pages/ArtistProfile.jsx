import { useState, useMemo, useEffect } from 'react';
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
  
  // گرفتن اطلاعات کاربر لاگین شده
  const user = useMemo(() => getCurrentUser(), []);

  // ۱. محاسبه اطلاعات هنرمند بدون تغییر مسیر (فقط منطق دیتا)
  const artist = useMemo(() => {
    return getArtistById(id);
  }, [id]);

  // ۲. مدیریت هدایت به صفحه اصلی در صورت پیدا نشدن هنرمند (باید در useEffect باشد)
  useEffect(() => {
    if (!artist) {
      navigate('/home');
    }
  }, [artist, navigate]);

  // ۳. مدیریت وضعیت Follow به صورت کاملاً داینامیک
  const [following, setFollowing] = useState(false);
  
  useEffect(() => {
    if (user && artist) {
      setFollowing(isFollowing(user.username, artist.id));
    }
  }, [id, user, artist]);

  // تا زمانی که دیتا لود نشده یا در حال ریدایرکت هستیم، چیزی رندر نکن تا ارور ندهد
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