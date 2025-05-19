import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box } from '@mui/material';

export type PrimitiveType = 'box' | 'pyramid';

export interface PrimitiveParams {
  type: PrimitiveType;
  length: number;
  width: number;
  height: number;
  number: number;
}

interface PrimitiveModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (params: PrimitiveParams) => void;
}

const defaultParams: PrimitiveParams = {
  type: 'box',
  length: 1,
  width: 1,
  height: 1,
  number: 1,
};

export default function PrimitiveModal({ open, onClose, onSubmit }: PrimitiveModalProps) {
  const [params, setParams] = useState<PrimitiveParams>(defaultParams);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: name === 'type' ? value : Number(value),
    }));
  };

  const handleOk = () => {
    onSubmit(params);
    setParams(defaultParams);
  };

  const handleCancel = () => {
    setParams(defaultParams);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>Add primitives group</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
          <TextField
            select
            label="Type"
            name="type"
            value={params.type}
            onChange={handleChange}
          >
            <MenuItem value="box">Box</MenuItem>
            <MenuItem value="pyramid">Pyramid</MenuItem>
          </TextField>
          <TextField label="Length" name="length" type="number" value={params.length} onChange={handleChange} />
          <TextField label="Width" name="width" type="number" value={params.width} onChange={handleChange} />
          <TextField label="Height" name="height" type="number" value={params.height} onChange={handleChange} />
          <TextField label="Number" name="number" type="number" value={params.number} onChange={handleChange} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleOk} variant="contained">OK</Button>
      </DialogActions>
    </Dialog>
  );
}
