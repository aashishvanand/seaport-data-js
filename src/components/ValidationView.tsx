'use client';

import React, { useState } from 'react';
import { Paper, Typography, Box, TextField, Grid, Chip } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { validateLocode } from 'seaport-data-js';

export default function ValidationView() {
    const [locodeInput, setLocodeInput] = useState('');
    const [locodeStatus, setLocodeStatus] = useState<boolean | null>(null);

    // Debounced LOCODE validation with stale-request guard
    React.useEffect(() => {
        if (locodeInput.length !== 5) {
            setLocodeStatus(null);
            return;
        }

        let cancelled = false;
        const timeoutId = setTimeout(async () => {
            try {
                const result = await validateLocode(locodeInput.toUpperCase());
                if (!cancelled) setLocodeStatus(result);
            } catch (e) {
                if (!cancelled) setLocodeStatus(false);
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };
    }, [locodeInput]);

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VerifiedUserIcon color="primary" /> Validation Utility
            </Typography>

            <Typography paragraph color="text.secondary">
                Verify whether a UN/LOCODE exists in the World Port Index dataset.
            </Typography>

            <Grid container justifyContent="center">
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>LOCODE Validator</Typography>
                        <TextField
                            fullWidth
                            label="Enter 5-Character LOCODE"
                            value={locodeInput}
                            onChange={(e) => setLocodeInput(e.target.value.toUpperCase())}
                            inputProps={{ maxLength: 5 }}
                            sx={{ mb: 2 }}
                        />

                        {locodeInput.length === 5 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                {locodeStatus ? (
                                    <Chip icon={<CheckCircleIcon />} label="Valid LOCODE" color="success" />
                                ) : (
                                    <Chip icon={<ErrorIcon />} label="Invalid LOCODE" color="error" />
                                )}
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
