import { List, ListItem, ListItemButton, ListItemText, Box } from '@mui/material';
import * as THREE from 'three';

export interface PrimitiveInfo {
  id: string;
  type: 'box' | 'pyramid';
  position: [number, number, number];
  color: string;
  selected: boolean;
  length: number;
  width: number;
  height: number;
  geometry: THREE.BufferGeometry;
}

interface PrimitiveListProps {
  items: PrimitiveInfo[];
  onSelect: (id: string) => void;
}

export default function PrimitiveList({ items, onSelect }: PrimitiveListProps) {
  return (
    <Box sx={{ width: 220, bgcolor: 'background.paper', height: '100vh', overflowY: 'auto' }}>
      <List>
        {(() => {
          let boxCount = 0;
          let pyramidCount = 0;
          return items.map((item) => {
            let label = '';
            if (item.type === 'box') {
              boxCount++;
              label = `Box ${boxCount}`;
            } else if (item.type === 'pyramid') {
              pyramidCount++;
              label = `Pyramid ${pyramidCount}`;
            } else {
              label = item.type;
            }
            return (
              <ListItem key={item.id} disablePadding>
                <ListItemButton selected={item.selected} onClick={() => onSelect(item.id)}>
                  <Box sx={{ width: 16, height: 16, bgcolor: item.color, borderRadius: 0.5, mr: 1, border: '1px solid #888' }} />
                  <ListItemText
                    primary={label}
                    secondary={`position: (${item.position.join(', ')})`}
                    primaryTypographyProps={{ color: item.selected ? 'primary' : 'inherit' }}
                  />
                </ListItemButton>
              </ListItem>
            );
          });
        })()}

      </List>
    </Box>
  );
}
