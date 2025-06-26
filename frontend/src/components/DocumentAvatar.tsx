// src/components/DocumentAvatar.tsx
import React from 'react';
import { Avatar } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface Props {
  fileName?: string;
  onClick?: () => void;
}

const DocumentAvatar: React.FC<Props> = ({ fileName, onClick }) => {
  if (!fileName) return <Avatar sx={{ bgcolor: '#ccc' }}>?</Avatar>;

  const isPdf = fileName.toLowerCase().endsWith('.pdf');
  const fileUrl = `http://localhost:5001/uploads/chauffeurs/${encodeURIComponent(fileName)}`;

  return isPdf ? (
    <Avatar sx={{ bgcolor: '#f44336', cursor: 'pointer' }} onClick={onClick}>
      <PictureAsPdfIcon />
    </Avatar>
  ) : (
    <Avatar
      src={fileUrl}
      sx={{ width: 40, height: 40, cursor: 'pointer' }}
      onClick={onClick}
    />
  );
};

export default DocumentAvatar;
