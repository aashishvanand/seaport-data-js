'use client'

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
  Grid,
  Alert,
  Tabs,
  Tab,
  Fade,
  CircularProgress
} from '@mui/material';
import AnchorIcon from '@mui/icons-material/Anchor';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart';
import WavesIcon from '@mui/icons-material/Waves';
import RouteIcon from '@mui/icons-material/Route';
import NearMeIcon from '@mui/icons-material/NearMe';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import dynamic from 'next/dynamic';

import {
  getPortByLocode,
  getPortsByCountryCode,
  searchByName,
  findPorts
} from 'seaport-data-js';

import { useColorMode } from './providers';
import { Port, SearchType } from '../types';

// Eagerly loaded components (needed on first tab)
import SearchBar from '../components/SearchBar';
import PortCard from '../components/PortCard';

// Map must be dynamically imported with ssr:false because leaflet references
// `window` at module evaluation time, which crashes in Cloudflare Workers.
const MapComponent = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <Box sx={{ height: 400, bgcolor: 'background.paper', borderRadius: 4 }} />
});

// Lazy-loaded tab components (only loaded when the user switches to them)
const StatsView = dynamic(() => import('../components/StatsView'), {
  loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
});
const DeepestPortsView = dynamic(() => import('../components/DeepestPortsView'), {
  loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
});
const DistanceView = dynamic(() => import('../components/DistanceView'), {
  loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
});
const NearbyView = dynamic(() => import('../components/NearbyView'), {
  loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
});
const ValidationView = dynamic(() => import('../components/ValidationView'), {
  loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
});
const LibrariesView = dynamic(() => import('../components/LibrariesView'), {
  loading: () => <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
});

// Module-level constant — stable references, never recreated
const searchFunctions: Record<SearchType, (query: string) => Promise<Port[]>> = {
  locode: getPortByLocode,
  country: getPortsByCountryCode,
  name: searchByName,
  harbor_size: (query: string) => findPorts({ harbor_size: query }),
  harbor_type: (query: string) => findPorts({ harbor_type: query })
};

const validationPatterns: Record<SearchType, RegExp> = {
  locode: /^[A-Z]{2}[A-Z0-9]{3}$/,
  country: /^[A-Z]{2}$/,
  name: /^.{2,}$/,
  harbor_size: /^.+$/,
  harbor_type: /^.+$/
};

export default function PortSearch() {
  const [activeTab, setActiveTab] = useState(0);
  const [results, setResults] = useState<Port[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const colorMode = useColorMode();

  // Cache to avoid redundant network requests
  const searchCache = useRef(new Map<string, Port[]>());

  const handleSearch = useCallback(async (type: SearchType, query: string) => {
    setLoading(true);
    setError('');

    try {
      const cacheKey = `${type}:${query}`;
      let validPorts: Port[];

      if (searchCache.current.has(cacheKey)) {
        validPorts = searchCache.current.get(cacheKey)!;
      } else {
        const portsResponse = await searchFunctions[type](query);
        const ports = Array.isArray(portsResponse) ? portsResponse : [portsResponse].filter(Boolean);

        if (ports && ports.length > 0) {
          validPorts = ports.filter(p => p.name);
          if (validPorts.length > 0) {
            searchCache.current.set(cacheKey, validPorts);
          }
        } else {
          validPorts = [];
        }
      }

      if (validPorts.length > 0) {
        setResults(validPorts);
        setError('');
      } else {
        setResults([]);
        setError(`No ports found for ${type}: ${query}`);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while fetching data.');
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const isValidInput = useCallback((type: SearchType, query: string): boolean => {
    if (!query) return false;
    return validationPatterns[type]?.test(query) || false;
  }, []);

  const handleTabChange = useCallback((_: React.SyntheticEvent, v: number) => {
    setActiveTab(v);
  }, []);

  const hasCoordinates = useMemo(() => results.some(p => p.latitude && p.longitude), [results]);

  const mapCenter = useMemo<[number, number]>(() => {
    if (results.length > 0 && results[0].latitude && results[0].longitude) {
      return [Number(results[0].latitude), Number(results[0].longitude)];
    }
    return [20, 0];
  }, [results]);

  const mapZoom = useMemo(() => results.length === 1 ? 10 : 3, [results.length]);

  const displayedResults = useMemo(() => results.slice(0, 20), [results]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Search
        return (
          <Fade in={activeTab === 0}>
            <Box>
              <SearchBar onSearch={handleSearch} loading={loading} isValid={isValidInput} />

              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              {results.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  {hasCoordinates && (
                    <Box sx={{ mb: 4 }}>
                      <MapComponent
                        center={mapCenter}
                        zoom={mapZoom}
                        markers={results}
                      />
                    </Box>
                  )}

                  <Typography variant="h6" gutterBottom color="text.secondary">
                    Found {results.length} results
                  </Typography>

                  <Grid container spacing={3}>
                    {displayedResults.map((port, index) => (
                      <Grid size={{ xs: 12, md: 6, lg: 4 }} key={`${port.wpi_number}-${index}`}>
                        <PortCard port={port} />
                      </Grid>
                    ))}
                  </Grid>
                  {results.length > 20 && (
                    <Alert severity="info" sx={{ mt: 2 }}>Only showing first 20 results.</Alert>
                  )}
                </Box>
              )}
            </Box>
          </Fade>
        );
      case 1: return <StatsView />;
      case 2: return <DeepestPortsView />;
      case 3: return <DistanceView />;
      case 4: return <NearbyView />;
      case 5: return <ValidationView />;
      case 6: return <LibrariesView />;
      default: return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" color="default" sx={{
        backdropFilter: 'blur(20px)',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none'
      }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <AnchorIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 800, background: `-webkit-linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Seaport Data
            </Typography>
            <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Box sx={{ bgcolor: 'background.default', flexGrow: 1, pb: 8 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Container maxWidth="xl">
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="Search" icon={<SearchIcon />} iconPosition="start" />
              <Tab label="Statistics" icon={<BarChartIcon />} iconPosition="start" />
              <Tab label="Deepest Ports" icon={<WavesIcon />} iconPosition="start" />
              <Tab label="Distance" icon={<RouteIcon />} iconPosition="start" />
              <Tab label="Nearby" icon={<NearMeIcon />} iconPosition="start" />
              <Tab label="Validation" icon={<VerifiedUserIcon />} iconPosition="start" />
              <Tab label="Libraries" icon={<LibraryBooksIcon />} iconPosition="start" />
            </Tabs>
          </Container>
        </Box>

        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {renderTabContent()}
        </Container>
      </Box>
    </Box>
  );
}
