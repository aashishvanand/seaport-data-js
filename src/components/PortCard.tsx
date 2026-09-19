'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Tooltip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PublicIcon from '@mui/icons-material/Public';
import WavesIcon from '@mui/icons-material/Waves';
import StraightIcon from '@mui/icons-material/Straight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import { Port } from '../types';
import ExternalLinks from './ExternalLinks';

export default React.memo(function PortCard({ port }: { port: Port }) {
    return (
        <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? '0 12px 24px -8px rgba(0, 0, 0, 0.6)'
                    : '0 12px 24px -8px rgba(0, 0, 0, 0.15)',
                borderColor: 'primary.main',
            }
        }}>
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" component="h2" sx={{
                            lineHeight: 1.2,
                            mb: 1,
                            fontWeight: 700
                        }}>
                            {port.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                            <LocationOnIcon fontSize="small" sx={{ fontSize: '1rem' }} />
                            <Typography variant="body2">{[port.country_name, port.country_code].filter(Boolean).join(', ')}</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
                        <Chip
                            label={port.locode || 'N/A'}
                            color="primary"
                            size="small"
                            sx={{ fontWeight: 700, borderRadius: '6px', minWidth: 50 }}
                        />
                        <Chip
                            label={`#${port.wpi_number}`}
                            variant="outlined"
                            size="small"
                            sx={{ fontWeight: 600, borderRadius: '6px', minWidth: 50, borderColor: 'divider' }}
                        />
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                    <Chip
                        icon={<PublicIcon sx={{ fontSize: '1rem !important' }} />}
                        label={port.harbor_size || 'Unknown'}
                        size="small"
                        sx={{ bgcolor: 'action.hover', borderRadius: '8px' }}
                    />
                    <Chip
                        label={port.harbor_type || 'Unknown'}
                        size="small"
                        sx={{ bgcolor: 'action.hover', borderRadius: '8px', textTransform: 'capitalize' }}
                    />
                    <Tooltip title={port.facility_container ? "Container Handling Available" : "No Container Facility Recorded"}>
                        <Chip
                            icon={port.facility_container ? <CheckCircleIcon sx={{ fontSize: '1rem !important' }} /> : <CancelIcon sx={{ fontSize: '1rem !important' }} />}
                            label={port.facility_container ? 'Container Port' : 'No Container Data'}
                            size="small"
                            color={port.facility_container ? 'success' : 'default'}
                            variant={port.facility_container ? 'filled' : 'outlined'}
                            sx={{ borderRadius: '8px' }}
                        />
                    </Tooltip>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                            <WavesIcon sx={{ fontSize: '0.9rem' }} /> Channel Depth
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                            {port.channel_depth_m != null ? `${port.channel_depth_m} m` : 'N/A'}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                            <StraightIcon sx={{ fontSize: '0.9rem', transform: 'rotate(90deg)' }} /> Max Draft
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                            {port.max_vessel_draft_m != null ? `${port.max_vessel_draft_m} m` : 'N/A'}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                            <PublicIcon sx={{ fontSize: '0.9rem' }} /> Nav Area
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                            {port.navarea || 'N/A'}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                            <LocationOnIcon sx={{ fontSize: '0.9rem' }} /> Coordinates
                        </Typography>
                        <Typography variant="body2" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
                            {Number(port.latitude).toFixed(2)}, {Number(port.longitude).toFixed(2)}
                        </Typography>
                    </Box>
                </Box>

                <ExternalLinks port={port} />
            </CardContent>
        </Card>
    );
});
