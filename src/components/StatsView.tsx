'use client';

import React, { useState } from 'react';
import {
    Paper, Typography, Box, TextField, Button, Grid,
    Card, CardContent
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import { getPortStatsByCountry, PortCountryStats } from 'seaport-data-js';

export default function StatsView() {
    const [input, setInput] = useState('');
    const [stats, setStats] = useState<PortCountryStats | null>(null);
    const [error, setError] = useState('');

    const handleFetchStats = async () => {
        setError('');
        setStats(null);
        try {
            if (input.length !== 2) throw new Error('Country code must be 2 letters');
            const result = await getPortStatsByCountry(input.toUpperCase());
            setStats(result);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch statistics');
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChartIcon color="primary" /> Port Statistics
            </Typography>

            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Country Code (e.g. SG, NL, US)"
                            value={input}
                            onChange={(e) => setInput(e.target.value.toUpperCase())}
                            inputProps={{ maxLength: 2 }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <Button variant="contained" onClick={handleFetchStats} disabled={input.length !== 2}>
                            Analyze
                        </Button>
                    </Grid>
                </Grid>

                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
                )}
            </Paper>

            {stats && (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                            <CardContent>
                                <Typography variant="h4" fontWeight={800}>{stats.total}</Typography>
                                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Total Ports</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Card sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
                            <CardContent>
                                <Typography variant="h4" fontWeight={800}>{stats.withContainerFacility}</Typography>
                                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>With Container Facility</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" gutterBottom>By Harbor Size</Typography>
                            {Object.entries(stats.byHarborSize).map(([key, value]) => (
                                <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="body2">{key}</Typography>
                                    <Typography variant="body2" fontWeight={600}>{value}</Typography>
                                </Box>
                            ))}
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" gutterBottom>By Harbor Type</Typography>
                            {Object.entries(stats.byHarborType).map(([key, value]) => (
                                <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="body2">{key}</Typography>
                                    <Typography variant="body2" fontWeight={600}>{value}</Typography>
                                </Box>
                            ))}
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}
