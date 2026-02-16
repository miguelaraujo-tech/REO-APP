import React from 'react';
import { Facebook, Instagram, Music2, Share2, Mail, Info, FolderArchive } from 'lucide-react';
import type { ReactNode } from 'react';
import type { SocialLink } from './types';

export const DRIVE_ARCHIVE_URL =
  'https://drive.google.com/drive/folders/12Pjs4lYRlokoQ7YzYqWo-OzvMkpBOkB6?usp=share_link';

export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/radioescolaronline',
    icon: <Facebook className="w-6 h-6" />,
    color: 'bg-blue-600',
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/reo_vizela_',
    icon: <Instagram className="w-6 h-6" />,
    color: 'bg-pink-600',
  },
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@reo_vizela_',
    icon: <Music2 className="w-6 h-6" />,
    color: 'bg-black',
  },
];

export type NavLink = {
  name: string;
  path: string;
  icon: ReactNode;
};

export const NAV_LINKS: NavLink[] = [
  { name: 'Redes Sociais', path: '/redes', icon: <Share2 className="w-5 h-5" /> },
  { name: 'Arquivo', path: '/arquivo', icon: <FolderArchive className="w-5 h-5" /> },
  { name: 'Contactar', path: '/contactar', icon: <Mail className="w-5 h-5" /> },
  { name: 'Sobre', path: '/sobre', icon: <Info className="w-5 h-5" /> },
];
