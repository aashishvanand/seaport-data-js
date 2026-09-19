'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Paper, Typography, Box, TextField, Button, Grid, Slider, Alert } from '@mui/material';
import NearMeIcon from '@mui/icons-material/NearMe';
import { findNearbyPorts } from 'seaport-data-js';
import { Port } from '../types';
import dynamic from 'next/dynamic';
import PortCard from './PortCard';

const MapComponent = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => <Box sx={{ height: 400, bgcolor: 'background.paper', borderRadius: 4 }} />
});

export default function NearbyView() {
    const [lat, setLat] = useState<number>(1.2905); // Singapore
    const [lon, setLon] = useState<number>(103.8520);
    const [radius, setRadius] = useState<number>(100);
    const [ports, setPorts] = useState<Port[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const mountedRef = useRef(true);
    useEffect(() => {
        return () => { mountedRef.current = false; };
    }, []);

    const handleSearch = async () => {
        setLoading(true);
        setSearched(true);
        try {
            const results = await findNearbyPorts(lat, lon, radius);
            if (mountedRef.current) setPorts(results || []);
        } catch (err) {
            if (process.env.NODE_ENV === 'development') console.error(err);
            if (mountedRef.current) setPorts([]);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    };

    const getUserLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    if (mountedRef.current) {
                        setLat(position.coords.latitude);
                        setLon(position.coords.longitude);
                    }
                },
                (error) => {
                    if (process.env.NODE_ENV === 'development') console.error("Error getting location", error);
                }
            );
        }
    }, []);

    const center = useMemo<[number, number]>(() => [lat, lon], [lat, lon]);

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NearMeIcon color="secondary" /> Nearby Ports
            </Typography>

            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <Button variant="outlined" startIcon={<NearMeIcon />} onClick={getUserLocation} sx={{ mb: 2 }}>
                        Use My Location
                    </Button>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Latitude"
                                type="number"
                                value={lat}
                                onChange={(e) => setLat(parseFloat(e.target.value))}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Longitude"
                                type="number"
                                value={lon}
                                onChange={(e) => setLon(parseFloat(e.target.value))}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Typography gutterBottom>Search Radius: {radius} km</Typography>
                <Slider
                    value={radius}
                    onChange={(_, val) => setRadius(val as number)}
                    min={10}
                    max={1000}
                    valueLabelDisplay="auto"
                    sx={{ mb: 3 }}
                />

                <Button variant="contained" fullWidth size="large" onClick={handleSearch} disabled={loading}>
                    {loading ? 'Searching...' : 'Find Ports'}
                </Button>
            </Paper>

            {searched && ports.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <MapComponent
                        center={center}
                        zoom={7}
                        markers={ports}
                    />
                </Box>
            )}

            {searched && ports.length === 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>No ports found within {radius}km.</Alert>
            )}

            <Grid container spacing={3}>
                {ports.slice(0, 30).map((port) => (
                    <Grid size={{ xs: 12, md: 6, lg: 4 }} key={port.wpi_number}>
                        <PortCard port={port} />
                    </Grid>
                ))}
            </Grid>
            {ports.length > 30 && (
                <Alert severity="info" sx={{ mt: 2 }}>Only showing the nearest 30 of {ports.length} results.</Alert>
            )}
        </Box>
    );
}
