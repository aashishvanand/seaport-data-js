'use client';

import React from 'react';
import {
    Typography, Box, Card, CardContent, Grid, Button, Paper, Stack
} from '@mui/material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CodeIcon from '@mui/icons-material/Code';
import TerminalIcon from '@mui/icons-material/Terminal';

interface Library {
    name: string;
    language: string;
    description: string;
    installCommand: string;
    githubUrl: string;
    registryUrl: string;
    registryLabel: string;
    icon: string;
    color: string;
}

const libraries: Library[] = [
    {
        name: 'seaport-data-js',
        language: 'JavaScript / TypeScript',
        description: 'Comprehensive seaport data library for Node.js and browser environments. Look up ports by UN/LOCODE, country, or name, filter by harbor characteristics, and calculate distances between ports. Sourced from the NGA World Port Index.',
        installCommand: 'npm install seaport-data-js',
        githubUrl: 'https://github.com/aashishvanand/seaport-data-js',
        registryUrl: 'https://www.npmjs.com/package/seaport-data-js',
        registryLabel: 'npm',
        icon: 'SP',
        color: '#0369a1',
    },
    {
        name: 'airport-data-js',
        language: 'JavaScript / TypeScript',
        description: "Sibling project to seaport-data-js. Comprehensive airport data library covering IATA/ICAO lookups, distance calculation, nearby airport search, and validation utilities.",
        installCommand: 'npm install airport-data-js',
        githubUrl: 'https://github.com/aashishvanand/airport-data-js',
        registryUrl: 'https://www.npmjs.com/package/airport-data-js',
        registryLabel: 'npm',
        icon: 'JS',
        color: '#f7df1e',
    },
];

function LibraryCard({ lib }: { lib: Library }) {
    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'visible',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
            }}
        >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: lib.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: lib.color === '#f7df1e' ? '#000' : '#fff',
                            fontWeight: 800,
                            fontSize: '1rem',
                            flexShrink: 0,
                        }}
                    >
                        {lib.icon}
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {lib.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {lib.language}
                        </Typography>
                    </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {lib.description}
                </Typography>

                <Paper
                    variant="outlined"
                    sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'action.hover',
                        fontFamily: 'monospace',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <TerminalIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography
                        variant="body2"
                        sx={{
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            color: 'text.primary',
                        }}
                    >
                        {lib.installCommand}
                    </Typography>
                </Paper>

                <Box sx={{ flexGrow: 1 }} />

                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<CodeIcon />}
                        endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                        href={lib.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        GitHub
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                        href={lib.registryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {lib.registryLabel}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default function LibrariesView() {
    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LibraryBooksIcon color="primary" /> Libraries
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 720 }}>
                seaport-data-js is currently available for JavaScript/TypeScript. It's a sibling project
                to airport-data-js, which additionally ships native libraries for Python, Dart, Rust,
                Swift, Go, and Kotlin — the same approach is planned for seaport data.
            </Typography>

            <Grid container spacing={3}>
                {libraries.map((lib) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 6 }} key={lib.name}>
                        <LibraryCard lib={lib} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
