import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Box } from '@mui/material';

interface StudentBarcodeProps {
  studentId: string;
  width?: number;
  height?: number;
}

const StudentBarcode: React.FC<StudentBarcodeProps> = ({ studentId, width = 280, height = 60 }) => {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && studentId) {
      JsBarcode(barcodeRef.current, studentId, {
        format: 'CODE128',
        lineColor: '#000000',
        width: 2,
        height,
        displayValue: true,
        fontSize: 14,
        margin: 10,
        font: 'monospace',
      });
    }
  }, [studentId, height]);

  return (
    <Box display="flex" justifyContent="center" my={1}>
      <svg ref={barcodeRef} />
    </Box>
  );
};

export default StudentBarcode;
