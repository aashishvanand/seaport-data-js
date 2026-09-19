'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Paper,
    Tabs,
    Tab,
    Box,
    TextField,
    Autocomplete,
    Typography,
    Button,
    InputAdornment,
    MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AnchorIcon from '@mui/icons-material/Anchor';
import { SearchType, Port } from '../types';
import { getAutocompleteSuggestions } from 'seaport-data-js';

interface SearchBarProps {
    onSearch: (type: SearchType, query: string) => void;
    loading: boolean;
    isValid: (type: SearchType, query: string) => boolean;
}

const harborSizes = ['Very Small', 'Small', 'Medium', 'Large'];
const harborTypes = ['Coastal (Natural)', 'River Natural', 'Open Roadstead', 'Coastal (Breakwater)', 'Coastal (Tide Gate)', 'Canal or Lake'];

export default React.memo(function SearchBar({ onSearch, loading, isValid }: SearchBarProps) {
    const [searchType, setSearchType] = useState<SearchType>('locode');
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Port[]>([]);

    // Debounced autocomplete with stale-request cancellation
    useEffect(() => {
        let active = true;

        const fetchSuggestions = async () => {
            if (query.length >= 2 && searchType === 'name') {
                try {
                    const autocompleteSuggestions = await getAutocompleteSuggestions(query);
                    if (active) setSuggestions(autocompleteSuggestions || []);
                } catch (err) {
                    if (process.env.NODE_ENV === 'development') console.error('Failed to fetch suggestions:', err);
                    if (active) setSuggestions([]);
                }
            } else {
                if (active) setSuggestions([]);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => {
            active = false;
            clearTimeout(timeoutId);
        };
    }, [query, searchType]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();
        const maxLengths: Record<string, number> = { locode: 5, country: 2 };
        if (maxLengths[searchType]) {
            setQuery(value.slice(0, maxLengths[searchType]));
        } else {
            setQuery(e.target.value);
        }
    }, [searchType]);

    const getHelperText = (type: SearchType) => {
        switch (type) {
            case 'locode': return "5-character UN/LOCODE (e.g. SGKEP)";
            case 'country': return "ISO 3166-1 alpha-2 code (e.g. SG, NL)";
            case 'name': return "Substring match on port name";
            default: return "";
        }
    };

    const handleSearchSubmit = useCallback(() => {
        if (isValid(searchType, query)) {
            onSearch(searchType, query);
        }
    }, [isValid, searchType, query, onSearch]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isValid(searchType, query)) {
            onSearch(searchType, query);
        }
    }, [isValid, searchType, query, onSearch]);

    const handleTypeChange = useCallback((_: React.SyntheticEvent, newValue: SearchType) => {
        setSearchType(newValue);
        setQuery('');
    }, []);

    return (
        <Paper sx={{
            p: 4,
            mb: 3,
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider'
        }}>
            <Box sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                opacity: 0.05,
                transform: 'rotate(-15deg)',
                pointerEvents: 'none'
            }}>
                <AnchorIcon sx={{ fontSize: 200 }} />
            </Box>

            <Typography variant="h5" gutterBottom fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SearchIcon color="primary" />
                Find Your Port
            </Typography>

            <Tabs
                value={searchType}
                onChange={handleTypeChange}
                sx={{ mb: 3 }}
                variant="scrollable"
                scrollButtons="auto"
                textColor="primary"
                indicatorColor="primary"
            >
                <Tab label="LOCODE" value="locode" sx={{ fontWeight: 600 }} />
                <Tab label="NAME" value="name" sx={{ fontWeight: 600 }} />
                <Tab label="COUNTRY" value="country" sx={{ fontWeight: 600 }} />
                <Tab label="HARBOR SIZE" value="harbor_size" sx={{ fontWeight: 600 }} />
                <Tab label="HARBOR TYPE" value="harbor_type" sx={{ fontWeight: 600 }} />
            </Tabs>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                {searchType === 'name' ? (
                    <Autocomplete
                        freeSolo
                        options={suggestions}
                        onChange={(event, newValue) => {
                            if (newValue && typeof newValue !== 'string') {
                                setQuery(newValue.name || '');
                            }
                        }}
                        getOptionLabel={(option) =>
                            typeof option === 'string' ? option : `${option.name}${option.locode ? ' - ' + option.locode : ''}`
                        }
                        renderOption={(props, option) => (
                            // @ts-ignore
                            <li {...props} key={option.wpi_number}>
                                <Box>
                                    <Typography variant="body1" fontWeight={600}>
                                        {option.name}{option.locode ? ` - ${option.locode}` : ''}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {[option.country_name, option.country_code].filter(Boolean).join(', ')}
                                    </Typography>
                                </Box>
                            </li>
                        )}
                        inputValue={query}
                        onInputChange={(_, newValue) => setQuery(newValue || '')}
                        sx={{ flexGrow: 1 }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Search by Name"
                                variant="outlined"
                                fullWidth
                                onKeyDown={handleKeyDown}
                                helperText={getHelperText(searchType)}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        )}
                    />
                ) : searchType === 'harbor_size' ? (
                    <TextField
                        select
                        fullWidth
                        label="Harbor Size"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    >
                        {harborSizes.map((size) => (
                            <MenuItem key={size} value={size}>{size}</MenuItem>
                        ))}
                    </TextField>
                ) : searchType === 'harbor_type' ? (
                    <TextField
                        select
                        fullWidth
                        label="Harbor Type"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    >
                        {harborTypes.map((type) => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                    </TextField>
                ) : (
                    <TextField
                        fullWidth
                        label={`Enter ${searchType === 'locode' ? 'LOCODE' : 'Country Code'}`}
                        variant="outlined"
                        value={query}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        error={query.length > 0 && !isValid(searchType, query)}
                        helperText={query.length > 0 && !isValid(searchType, query) ? `Invalid format` : getHelperText(searchType)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            )
                        }}
                    />
                )}
                <Button
                    variant="contained"
                    onClick={handleSearchSubmit}
                    disabled={loading || !isValid(searchType, query)}
                    size="large"
                    sx={{ minWidth: 140, height: 56 }}
                >
                    {loading ? 'Searching...' : 'Search'}
                </Button>
            </Box>
        </Paper>
    );
});
