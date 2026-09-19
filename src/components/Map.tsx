'use client';

import React, { useEffect, useState } from 'react';
import { Box, useTheme, Paper } from '@mui/material';
import { Port } from '../types';
import dynamic from 'next/dynamic';

// Dynamic import for Leaflet components with explicit typing
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);
const Polyline = dynamic(
    () => import('react-leaflet').then((mod) => mod.Polyline),
    { ssr: false }
);

// Dynamic import for useMap hook (used for programmatic view changes)
const MapViewUpdater = dynamic(
    () => import('react-leaflet').then((mod) => {
        const { useMap } = mod;
        function ViewUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
            const map = useMap();
            useEffect(() => {
                map.setView(center, zoom);
            }, [center, zoom, map]);
            return null;
        }
        return ViewUpdater;
    }),
    { ssr: false }
);

interface MapComponentProps {
    center: [number, number];
    zoom: number;
    markers: Port[];
    route?: [number, number][];
}

const createAnchorIcon = async (isDarkMode: boolean) => {
    if (typeof window === 'undefined') return null;
    const L = await import('leaflet');

    return new L.DivIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${isDarkMode ? '#38bdf8' : '#0369a1'}" width="30px" height="30px" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C10.62 2 9.5 3.12 9.5 4.5c0 1.09.7 2.01 1.67 2.35L11 8H8c-1.1 0-2 .9-2 2h2c0 3.31 2 6.14 5 7.35V19H9v2h6v-2h-4v-1.65c3-1.21 5-4.04 5-7.35h2c0-1.1-.9-2-2-2h-3l-.17-1.15A2.5 2.5 0 0 0 14.5 4.5C14.5 3.12 13.38 2 12 2zm0 1.5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/></svg>`,
        className: 'custom-anchor-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });
}

export default React.memo(function MapComponent({ center, zoom, markers, route }: MapComponentProps) {
    const theme = useTheme();
    const [isMounted, setIsMounted] = useState(false);
    const [anchorIcon, setAnchorIcon] = useState<any>(null);

    useEffect(() => {
        // Load leaflet CSS client-side only
        import('leaflet/dist/leaflet.css');
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;
        let cancelled = false;
        createAnchorIcon(theme.palette.mode === 'dark').then((icon) => {
            if (!cancelled) setAnchorIcon(icon);
        });
        return () => { cancelled = true; };
    }, [isMounted, theme.palette.mode]);

    if (!isMounted) return <Box sx={{ height: 400, bgcolor: 'background.paper', borderRadius: 4 }} />;

    return (
        <Paper sx={{ p: 1, borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ height: 450, width: '100%', borderRadius: 3, overflow: 'hidden' }}>
                {/* @ts-ignore */}
                <MapContainer
                    center={center}
                    zoom={zoom}
                    style={{ height: '100%', width: '100%' }}
                >
                    {/* @ts-ignore */}
                    <MapViewUpdater center={center} zoom={zoom} />
                    {/* @ts-ignore */}
                    <TileLayer
                        url={theme.palette.mode === 'dark'
                            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                            : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'}
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />

                    {markers.map((port, index) => (
                        port.latitude && port.longitude ? (
                            // @ts-ignore
                            <Marker
                                key={`${port.locode}-${port.wpi_number}-${index}`}
                                position={[Number(port.latitude), Number(port.longitude)]}
                                icon={anchorIcon}
                            >
                                {/* @ts-ignore */}
                                <Popup>
                                    <div style={{ fontFamily: theme.typography.fontFamily }}>
                                        <strong>{port.name}</strong><br />
                                        <span style={{ color: '#666' }}>{port.locode || 'No LOCODE'}</span><br />
                                        {[port.country_name, port.country_code].filter(Boolean).join(', ')}
                                    </div>
                                </Popup>
                            </Marker>
                        ) : null
                    ))}

                    {route && route.length > 0 && (
                        // @ts-ignore
                        <Polyline
                            positions={route}
                            color={theme.palette.primary.main}
                            weight={4}
                            opacity={0.7}
                            dashArray="10, 10"
                        />
                    )}
                </MapContainer>
            </Box>
        </Paper>
    );
});
