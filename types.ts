
export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  url?: string;
  driveUrl?: string; // Link direto para a pasta no Google Drive
  children?: FileItem[];
}

export interface SocialLink {
  name: string;
  url: string;
  icon: any;
  color: string;
}
