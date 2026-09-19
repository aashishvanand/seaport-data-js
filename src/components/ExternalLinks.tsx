'use client';

import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { Port } from '../types';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MapIcon from '@mui/icons-material/Map';
import DescriptionIcon from '@mui/icons-material/Description';

// Hoisted to module scope — stable reference, never recreated
const linkTypes = [
    { key: 'sailing_directions', label: 'Sailing Directions', icon: <MenuBookIcon fontSize="small" /> },
    { key: 'publication_link', label: 'WPI Publication', icon: <DescriptionIcon fontSize="small" /> },
    { key: 'standard_nautical_chart', label: 'Standard Chart', icon: <MapIcon fontSize="small" /> },
    { key: 'digital_nautical_chart', label: 'Digital Chart', icon: <MapIcon fontSize="small" /> },
];

export default React.memo(function ExternalLinks({ port }: { port: Port }) {
    const hasLinks = linkTypes.some(({ key }) => port[key]);

    if (!hasLinks) return null;

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Nautical Resources
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {linkTypes.map(({ key, label, icon }) => {
                    const value = port[key] as string | null | undefined;
                    if (!value) return null;
                    // Some fields are plain identifiers (e.g. chart numbers), not URLs — only link when it looks like one.
                    const isUrl = /^https?:\/\//i.test(value);
                    return (
                        <Chip
                            key={key}
                            label={isUrl ? label : `${label}: ${value}`}
                            icon={icon}
                            component={isUrl ? 'a' : 'div'}
                            href={isUrl ? value : undefined}
                            target={isUrl ? '_blank' : undefined}
                            rel={isUrl ? 'noopener noreferrer' : undefined}
                            clickable={isUrl}
                            size="small"
                            variant="outlined"
                            sx={{
                                fontSize: '0.75rem',
                                borderRadius: '8px',
                                '&:hover': isUrl ? {
                                    bgcolor: 'action.hover',
                                    borderColor: 'primary.main',
                                    color: 'primary.main'
                                } : undefined,
                            }}
                        />
                    );
                })}
            </Box>
        </Box>
    );
});
