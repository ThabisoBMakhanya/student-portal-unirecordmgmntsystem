import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Box } from '@mui/material';

interface StudentQRCodeProps {
  studentId: string;
  size?: number;
}

const StudentQRCode: React.FC<StudentQRCodeProps> = ({ studentId, size = 120 }) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    if (studentId) {
      const qrData = JSON.stringify({ id: studentId, type: 'student', uni: 'Limkokwing Eswatini' });
      QRCode.toDataURL(qrData, { errorCorrectionLevel: 'M', margin: 2, width: size })
        .then(url => setQrUrl(url))
        .catch(() => {});
    }
  }, [studentId, size]);

  if (!qrUrl) return null;
  return (
    <Box display="flex" justifyContent="center" my={1}>
      <img src={qrUrl} alt={`QR for ${studentId}`} style={{ width: size, height: size }} />
    </Box>
  );
};

export default StudentQRCode;
