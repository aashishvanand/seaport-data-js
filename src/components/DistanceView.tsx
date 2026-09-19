'use client';

import React, { useState, useMemo } from 'react';
import { Paper, Typography, Box, TextField, Button, Grid, Alert } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import RouteIcon from '@mui/icons-material/Route';
import { calculateDistance, getPortByLocode } from 'seaport-data-js';
import { Port } from '../types';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => <Box sx={{ height: 400, bgcolor: 'background.paper', borderRadius: 4 }} />
});

export default function DistanceView() {
    const [code1, setCode1] = useState('');
    const [code2, setCode2] = useState('');
    const [result, setResult] = useState<number | null>(null);
    const [port1, setPort1] = useState<Port | null>(null);
    const [port2, setPort2] = useState<Port | null>(null);
    const [error, setError] = useState('');

    const handleCalculate = async () => {
        setError('');
        setResult(null);
        setPort1(null);
        setPort2(null);

        if (!code1 || !code2) return;

        try {
            const dist = await calculateDistance(code1.toUpperCase(), code2.toUpperCase());
            if (dist === null) {
                setError('Could not find one or both ports.');
                return;
            }
            setResult(dist);

            const [p1res, p2res] = await Promise.all([
                getPortByLocode(code1.toUpperCase()),
                getPortByLocode(code2.toUpperCase())
            ]);

            const p1 = p1res?.[0];
            const p2 = p2res?.[0];
            if (p1 && p2) {
                setPort1(p1);
                setPort2(p2);
            }
        } catch (err) {
            setError('Failed to calculate distance or find ports.');
            if (process.env.NODE_ENV === 'development') console.error(err);
        }
    };

    const mapCenter = useMemo<[number, number]>(() =>
        port1 && port2
            ? [(Number(port1.latitude) + Number(port2.latitude)) / 2, (Number(port1.longitude) + Number(port2.longitude)) / 2]
            : [20, 0],
        [port1, port2]
    );

    const mapMarkers = useMemo(() =>
        port1 && port2 ? [port1, port2] : [],
        [port1, port2]
    );

    const mapRoute = useMemo<[number, number][] | undefined>(() =>
        port1 && port2
            ? [[Number(port1.latitude), Number(port1.longitude)], [Number(port2.latitude), Number(port2.longitude)]]
            : undefined,
        [port1, port2]
    );

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RouteIcon color="primary" /> Distance Calculator
            </Typography>

            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            fullWidth
                            label="From (LOCODE)"
                            value={code1}
                            onChange={(e) => setCode1(e.target.value.toUpperCase())}
                            inputProps={{ maxLength: 5 }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            fullWidth
                            label="To (LOCODE)"
                            value={code2}
                            onChange={(e) => setCode2(e.target.value.toUpperCase())}
                            inputProps={{ maxLength: 5 }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Button variant="contained" fullWidth size="large" onClick={handleCalculate} disabled={!code1 || !code2}>
                            Calculate
                        </Button>
                    </Grid>
                </Grid>

                {result !== null && (
                    <Alert severity="success" icon={<MapIcon />} sx={{ mt: 3, borderRadius: 2 }}>
                        <Typography variant="subtitle1" component="div">
                            Great-Circle Distance: <strong>{Math.round(result)} km</strong> / <strong>{Math.round(result * 0.539957)} nautical miles</strong>
                        </Typography>
                    </Alert>
                )}

                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </Paper>

            {port1 && port2 && (
                <MapComponent
                    center={mapCenter}
                    zoom={2}
                    markers={mapMarkers}
                    route={mapRoute}
                />
            )}
        </Box>
    );
}
