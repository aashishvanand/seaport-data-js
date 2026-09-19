'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Paper, Typography, Box, Grid, FormControl, InputLabel, Select, MenuItem,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, TextField
} from '@mui/material';
import WavesIcon from '@mui/icons-material/Waves';
import { findPorts } from 'seaport-data-js';
import { Port } from '../types';

type SortField = 'channel_depth_m' | 'max_vessel_draft_m';

export default function DeepestPortsView() {
    const [countryCode, setCountryCode] = useState('NL');
    const [sortBy, setSortBy] = useState<SortField>('channel_depth_m');
    const [limit, setLimit] = useState(10);
    const [ports, setPorts] = useState<Port[]>([]);
    const [loading, setLoading] = useState(false);

    // Cache results to avoid refetching when toggling between previously-viewed combinations
    const cache = useRef(new Map<string, Port[]>());

    useEffect(() => {
        if (countryCode.length !== 2) return;
        const cacheKey = `${countryCode}-${sortBy}-${limit}`;

        if (cache.current.has(cacheKey)) {
            setPorts(cache.current.get(cacheKey)!);
            return;
        }

        let cancelled = false;
        const fetchPorts = async () => {
            setLoading(true);
            try {
                const all = await findPorts({ country_code: countryCode });
                const sorted = all
                    .filter(p => p[sortBy] != null)
                    .sort((a, b) => (b[sortBy] as number) - (a[sortBy] as number))
                    .slice(0, limit);
                if (!cancelled) {
                    cache.current.set(cacheKey, sorted);
                    setPorts(sorted);
                }
            } catch (err) {
                if (process.env.NODE_ENV === 'development') console.error(err);
                if (!cancelled) setPorts([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchPorts();

        return () => { cancelled = true; };
    }, [countryCode, sortBy, limit]);

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WavesIcon color="secondary" /> Deepest Ports
            </Typography>

            <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Country Code"
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                            inputProps={{ maxLength: 2 }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Sort By</InputLabel>
                            <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value as SortField)}>
                                <MenuItem value="channel_depth_m">Channel Depth</MenuItem>
                                <MenuItem value="max_vessel_draft_m">Max Vessel Draft</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Limit</InputLabel>
                            <Select value={limit} label="Limit" onChange={(e) => setLimit(Number(e.target.value))}>
                                <MenuItem value={5}>Top 5</MenuItem>
                                <MenuItem value={10}>Top 10</MenuItem>
                                <MenuItem value={20}>Top 20</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                            <TableCell>Port</TableCell>
                            <TableCell>LOCODE</TableCell>
                            <TableCell>Harbor Size</TableCell>
                            <TableCell align="right">{sortBy === 'channel_depth_m' ? 'Channel Depth' : 'Max Vessel Draft'}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>Loading...</TableCell>
                            </TableRow>
                        ) : ports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>No ports with recorded depth data for this country.</TableCell>
                            </TableRow>
                        ) : ports.map((port, index) => (
                            <TableRow key={port.wpi_number} hover>
                                <TableCell>
                                    <Chip
                                        label={`#${index + 1}`}
                                        size="small"
                                        color={index < 3 ? "primary" : "default"}
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={600}>{port.name}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip label={port.locode || 'N/A'} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                </TableCell>
                                <TableCell>{port.harbor_size || 'Unknown'}</TableCell>
                                <TableCell align="right">
                                    <Typography fontWeight={600} color="primary">
                                        {port[sortBy] as number} m
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
