// src/components/Icons.jsx
export const MusicIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 18V5L21 3V16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="6" cy="18" r="3" stroke={color} strokeWidth="2"/>
    <circle cx="18" cy="16" r="3" stroke={color} strokeWidth="2"/>
  </svg>
);

export const FolderUploadIcon = ({ size = 40, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11V17" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 14L12 11L15 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const EditIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 20H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.5 3.5C16.8978 3.10217 17.4374 2.87868 18 2.87868C18.5626 2.87868 19.1022 3.10217 19.5 3.5C19.8978 3.89782 20.1213 4.43739 20.1213 5C20.1213 5.56261 19.8978 6.10217 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const DeleteIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 6H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="10" y1="11" x2="10" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="14" y1="11" x2="14" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const WarningIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <line x1="12" y1="8" x2="12" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1" fill={color}/>
  </svg>
);

export const SpinnerIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" strokeDasharray="30 30" strokeLinecap="round"/>
    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
  </svg>
);

export const UploadIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21 15V19C21 20 20 21 19 21H5C4 21 3 20 3 19V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 10L12 5L17 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 5V16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const EmptyMusicIcon = ({ size = 64, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" strokeDasharray="4 4"/>
    <path d="M8 15V9L14 7V13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="6" cy="15" r="2" stroke={color} strokeWidth="1.5"/>
    <circle cx="12" cy="13" r="2" stroke={color} strokeWidth="1.5"/>
  </svg>
);

export const SearchIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2"/>
    <path d="M16 16L21 21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const SortIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 7H21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M6 12H18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 17H14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const ArrowUpIcon = ({ size = 16, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 19V5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 12L12 5L19 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ArrowDownIcon = ({ size = 16, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 5V19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 12L12 19L5 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PlayIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <polygon points="5,3 19,12 5,21" fill={color} stroke="none"/>
  </svg>
);

export const PauseIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="6" y="4" width="4" height="16" fill={color} stroke="none"/>
    <rect x="14" y="4" width="4" height="16" fill={color} stroke="none"/>
  </svg>
);

export const CloseIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const UserIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2"/>
    <path d="M5 20C5 16 8 14 12 14C16 14 19 16 19 20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const LyricsIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 6H20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M4 12H14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M4 18H10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const BackIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M19 12H5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 19L5 12L12 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const AudioIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3"  y="10" width="2.4" height="4"  rx="1.2" fill={color} />
    <rect x="7"  y="7"  width="2.4" height="10" rx="1.2" fill={color} />
    <rect x="11" y="4"  width="2.4" height="16" rx="1.2" fill={color} />
    <rect x="15" y="8"  width="2.4" height="8"  rx="1.2" fill={color} />
    <rect x="19" y="10" width="2.4" height="4"  rx="1.2" fill={color} />
  </svg>
);

export const EarIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 8.5A6.5 6.5 0 1 1 19 8.5c0 6-6 6-6 10a3.5 3.5 0 0 1-7 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 8.5a3.5 3.5 0 1 1 6.24 2.18c-.6.74-1.49 1.32-1.49 2.32a1.5 1.5 0 0 1-3 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PlaysIcon = ({ size = 20, color = '#2f88ff', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" fill={color}/>
    <path d="M9.5 7.5v9l7-4.5z" fill="#fff"/>
  </svg>
);

export const MoneyBagIcon = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 3h6l-1.5 3h-3z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.5 6c3 1.5 5.5 5 5.5 9a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6c0-4 2.5-7.5 5.5-9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11v6M10 12.5h2.5a1.25 1.25 0 0 1 0 2.5H10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


// ===== آیکون‌های جدید برای MusicArchive, MusicPlayer, PlaylistDetail و Admin =====
export const PlayIconForPlayList = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <polygon points="5,3 19,12 5,21" fill={color} stroke="none" />
  </svg>
);

export const PauseIconForPlayList = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="6" y="4" width="4" height="16" fill={color} stroke="none" />
    <rect x="14" y="4" width="4" height="16" fill={color} stroke="none" />
  </svg>
);

export const ShuffleIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M16 3H21V8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 20L21 3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M21 16V21H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 9L21 3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const RepeatIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M17 1L21 5L17 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 11V9C3 5.68629 5.68629 3 9 3H21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 23L3 19L7 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 13V15C21 18.3137 18.3137 21 15 21H3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const VolumeIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 9H7L12 4V20L7 15H3V9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 8C16.5 9.5 16.5 14.5 15 16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 5C20.5 8 20.5 16 18 19" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const ListMusicIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 6H20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M4 12H16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M4 18H10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M19 15V9L23 7V13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="17" cy="15" r="2" stroke={color} strokeWidth="2"/>
    <circle cx="21" cy="13" r="2" stroke={color} strokeWidth="2"/>
  </svg>
);

export const MinimizeIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8 3V9H2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3V9H22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 21V15H2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 21V15H22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const LyricsIconForPlayList = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 6H20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M4 12H14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M4 18H10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="18" cy="12" r="2" stroke={color} strokeWidth="2"/>
    <path d="M20 12V16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const XIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ChevronLeftIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ChevronRightIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 18L15 12L9 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ArrowLeftIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M19 12H5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 19L5 12L12 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PlusIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 5V19" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const MinusIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);