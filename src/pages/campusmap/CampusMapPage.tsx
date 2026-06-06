import React, { useState, useMemo } from 'react';
import {
  Box, Typography, TextField, InputAdornment, Card, CardContent,
  Chip, List, ListItem, ListItemText, ListItemIcon, IconButton,
  Button, Drawer, Divider, useMediaQuery, useTheme, CircularProgress,
} from '@mui/material';
import {
  Search, LocationOn, Directions, School, LocalLibrary,
  Restaurant, LocalParking, WC, DirectionsBus, Info,
  MyLocation, Layers, Close, ArrowBack, Building,
  BusinessCenter, LocalHospital,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

interface Building {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  coords: { x: number; y: number };
  color: string;
}

interface MapLayer {
  id: string;
  name: string;
  icon: React.ReactNode;
  categories: string[];
  color: string;
  visible: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  academic: '#1976d2',
  administrative: '#ed6c02',
  library: '#2e7d32',
  cafeteria: '#f57c00',
  parking: '#757575',
  sports: '#9c27b0',
  health: '#d32f2f',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  academic: <School />,
  administrative: <BusinessCenter />,
  library: <LocalLibrary />,
  cafeteria: <Restaurant />,
  parking: <LocalParking />,
  sports: <DirectionsBus />,
  health: <LocalHospital />,
};

const CampusMapPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [search, setSearch] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [hiddenLayerIds, setHiddenLayerIds] = useState<Set<string>>(new Set());
  const [showImportant, setShowImportant] = useState(false);
  const [showLayers, setShowLayers] = useState(false);

  const { data: buildings = [], isLoading: buildingsLoading } = useQuery<Building[]>({
    queryKey: ['campus-map', 'buildings'],
    queryFn: async () => {
      const res = await apiClient.get('/api/student/campus-map/buildings');
      return (res.data.data?.buildings || []).map((b: any) => ({
        id: b._id,
        name: b.name,
        code: b.abbreviation,
        category: b.category,
        description: b.description,
        coords: b.coordinates,
        color: CATEGORY_COLORS[b.category] || '#1976d2',
      }));
    },
  });

  const { data: importantPlaces = [], isLoading: placesLoading } = useQuery({
    queryKey: ['campus-map', 'places'],
    queryFn: async () => {
      const res = await apiClient.get('/api/student/campus-map/places');
      return (res.data.data?.places || []).map((p: any) => ({
        name: p.name,
        location: p.description || p.building || '',
        id: p.building || p._id,
      }));
    },
  });

  const { data: apiLayers = [], isLoading: layersLoading } = useQuery<MapLayer[]>({
    queryKey: ['campus-map', 'layers'],
    queryFn: async () => {
      const res = await apiClient.get('/api/student/campus-map/layers');
      return (res.data.data?.layers || []).map((l: any) => ({
        id: l.id,
        name: l.name.charAt(0).toUpperCase() + l.name.slice(1),
        icon: CATEGORY_ICONS[l.id] || <LocationOn />,
        categories: [l.id],
        color: CATEGORY_COLORS[l.id] || '#1976d2',
        visible: true,
      }));
    },
  });

  const layers = useMemo(() => {
    return apiLayers.map(l => ({
      ...l,
      visible: !hiddenLayerIds.has(l.id),
    }));
  }, [apiLayers, hiddenLayerIds]);

  const toggleLayer = (id: string) => {
    setHiddenLayerIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visibleCategories = useMemo(() => {
    return layers.filter(l => l.visible).flatMap(l => l.categories);
  }, [layers]);

  const visibleBuildings = useMemo(() => {
    const filtered = search
      ? buildings.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || b.code.toLowerCase().includes(search.toLowerCase()))
      : buildings;
    return filtered.filter(b => visibleCategories.includes(b.category));
  }, [search, visibleCategories, buildings]);

  const getCategoryIcon = (category: string) => {
    return CATEGORY_ICONS[category] || <LocationOn />;
  };

  const getCategoryColor = (category: string) => {
    const layer = layers.find(l => l.categories.includes(category));
    return layer?.color || '#1976d2';
  };

  if (buildingsLoading || placesLoading || layersLoading) {
    return (
      <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (buildings.length === 0) {
    return (
      <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
        <Typography variant="h5" color="text.secondary">No campus map data available</Typography>
        <Typography variant="body2" color="text.disabled">Please contact the administration if this persists.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>Campus Map</Typography>
          <Typography variant="body1" color="text.secondary">Find any building or location on campus</Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button variant={showImportant ? 'contained' : 'outlined'} size="small" startIcon={<Info />} onClick={() => setShowImportant(!showImportant)}>
            Important Places
          </Button>
          <Button variant={showLayers ? 'contained' : 'outlined'} size="small" startIcon={<Layers />} onClick={() => setShowLayers(!showLayers)}>
            Layers
          </Button>
        </Box>
      </Box>

      <Box display="flex" gap={2} flex={1} minHeight={0}>
        <Box flex={1} display="flex" flexDirection="column" gap={2}>
          <TextField
            fullWidth
            placeholder="Search building by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
            }}
          />

          <Card sx={{ flex: 1, position: 'relative', overflow: 'hidden', bgcolor: '#f0f4f8' }}>
            <CardContent sx={{ p: 0, height: '100%', position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
                <Typography variant="caption" color="text.secondary">
                  N ↑
                </Typography>
              </Box>

              <svg viewBox="0 0 100 85" style={{ width: '100%', height: '100%', background: '#e8f0fe' }}>
                <rect x="0" y="0" width="100" height="85" fill="#e8f0fe" rx="4" />

                {/* Grid lines */}
                {Array.from({ length: 10 }).map((_, i) => (
                  <line key={`v${i}`} x1={i * 10} y1={0} x2={i * 10} y2={85} stroke="#d0d8e8" strokeWidth="0.3" />
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <line key={`h${i}`} x1={0} y1={i * 10} x2={100} y2={i * 10} stroke="#d0d8e8" strokeWidth="0.3" />
                ))}

                {/* Paths */}
                <rect x="18" y="18" width="3" height="50" fill="#c8d6e5" rx="1" />
                <rect x="40" y="10" width="3" height="70" fill="#c8d6e5" rx="1" />
                <rect x="65" y="10" width="3" height="60" fill="#c8d6e5" rx="1" />

                {/* Buildings */}
                {visibleBuildings.map((b) => (
                  <g key={b.id} onClick={() => setSelectedBuilding(b)} style={{ cursor: 'pointer' }}>
                    <rect
                      x={b.coords.x - 6}
                      y={b.coords.y - 5}
                      width="12"
                      height="10"
                      rx="1.5"
                      fill={b.color}
                      opacity={selectedBuilding?.id === b.id ? 1 : 0.85}
                      stroke={selectedBuilding?.id === b.id ? '#fff' : 'none'}
                      strokeWidth={selectedBuilding?.id === b.id ? 2 : 0}
                    />
                    <text
                      x={b.coords.x}
                      y={b.coords.y + 1}
                      textAnchor="middle"
                      fill="white"
                      fontSize="3"
                      fontWeight="bold"
                    >
                      {b.code}
                    </text>
                  </g>
                ))}
              </svg>
            </CardContent>
          </Card>
        </Box>

        {(showImportant || showLayers || selectedBuilding) && (
          <Box sx={{ width: isMobile ? 280 : 320, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {selectedBuilding && (
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getCategoryIcon(selectedBuilding.category)}
                      <Typography variant="h6" fontWeight="bold">{selectedBuilding.name}</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setSelectedBuilding(null)}><Close /></IconButton>
                  </Box>
                  <Chip
                    label={selectedBuilding.category.replace('_', ' ')}
                    size="small"
                    sx={{ bgcolor: selectedBuilding.color, color: 'white', mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary" paragraph>{selectedBuilding.description}</Typography>
                  <Button fullWidth variant="contained" size="small" startIcon={<Directions />} href={`https://www.google.com/maps/dir/?api=1&destination=${selectedBuilding.name}`} target="_blank">
                    Get Directions (Google Maps)
                  </Button>
                </CardContent>
              </Card>
            )}

            {showImportant && (
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Important Places for New Students
                  </Typography>
                  <List dense>
                    {importantPlaces.map((place: any) => (
                      <ListItem key={place.name} divider button onClick={() => {
                        const b = buildings.find(x => x.id === place.id);
                        if (b) setSelectedBuilding(b);
                      }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <LocationOn color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={place.name}
                          secondary={place.location}
                          primaryTypographyProps={{ fontWeight: 500, variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}

            {showLayers && (
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Map Layers
                  </Typography>
                  <List dense>
                    {layers.map((layer) => (
                      <ListItem key={layer.id} button onClick={() => toggleLayer(layer.id)}>
                        <Box display="flex" alignItems="center" gap={1.5} width="100%">
                          <Box
                            sx={{
                              width: 20, height: 20, borderRadius: 0.5, border: '2px solid',
                              borderColor: 'divider',
                              bgcolor: layer.visible ? layer.color : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: '0.2s',
                            }}
                          >
                            {layer.visible && <Typography variant="caption" color="white" fontSize={12}>✓</Typography>}
                          </Box>
                          <Box display="flex" alignItems="center" gap={1} flex={1}>
                            <Box sx={{ color: layer.color }}>{layer.icon}</Box>
                            <ListItemText
                              primary={layer.name}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </Box>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CampusMapPage;
