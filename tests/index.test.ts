import type { Port, PortWithDistance, PortCountryStats, DistanceMatrix } from '../types/index';

const {
    getPortByLocode,
    getPortsByCountryCode,
    searchByName,
    getAutocompleteSuggestions,
    findNearbyPorts,
    findNearestPort,
    findPorts,
    getPortCount,
    getMultiplePorts,
    calculateDistance,
    calculateDistanceMatrix,
    getPortStatsByCountry,
    validateLocode
} = require('../lib/index.js');

describe('Seaport Data Library (Live Data)', () => {

    describe('getPortByLocode', () => {
        test('should retrieve port data for a valid LOCODE', async () => {
            const [port]: Port[] = await getPortByLocode('SGKEP');
            expect(port.locode).toBe('SGKEP');
            expect(port.country_code).toBe('SG');
        });

        test('should be case-insensitive and tolerate a space', async () => {
            const [port]: Port[] = await getPortByLocode('sg kep');
            expect(port.locode).toBe('SGKEP');
        });

        test('should return an empty array for an unknown LOCODE', async () => {
            const results: Port[] = await getPortByLocode('ZZZZZ');
            expect(results).toEqual([]);
        });

        test('should throw on malformed input', async () => {
            await expect(getPortByLocode('X')).rejects.toThrow();
        });
    });

    describe('getPortsByCountryCode', () => {
        test('should retrieve all ports for a country', async () => {
            const ports: Port[] = await getPortsByCountryCode('SG');
            expect(ports.length).toBeGreaterThan(0);
            expect(ports.every(p => p.country_code === 'SG')).toBe(true);
        });
    });

    describe('searchByName', () => {
        test('should find ports by partial name match', async () => {
            const results: Port[] = await searchByName('rotterdam');
            expect(results.length).toBeGreaterThan(0);
            expect(results.some(p => p.name?.toLowerCase().includes('rotterdam'))).toBe(true);
        });

        test('should return an empty array for an empty query', async () => {
            const results: Port[] = await searchByName('');
            expect(results).toEqual([]);
        });
    });

    describe('getAutocompleteSuggestions', () => {
        test('should return prefix matches capped at 10', async () => {
            const results: Port[] = await getAutocompleteSuggestions('port');
            expect(results.length).toBeLessThanOrEqual(10);
            expect(results.every(p => p.name?.toLowerCase().startsWith('port'))).toBe(true);
        });
    });

    describe('findNearbyPorts', () => {
        test('should find ports within a radius, sorted nearest-first', async () => {
            const results: PortWithDistance[] = await findNearbyPorts(1.29, 103.85, 50);
            expect(results.length).toBeGreaterThan(0);
            for (let i = 1; i < results.length; i++) {
                expect(results[i].distance).toBeGreaterThanOrEqual(results[i - 1].distance);
            }
        });
    });

    describe('findNearestPort', () => {
        test('should find the single nearest port', async () => {
            const nearest: PortWithDistance | null = await findNearestPort(1.29, 103.85);
            expect(nearest).not.toBeNull();
            expect(nearest!.distance).toBeGreaterThanOrEqual(0);
        });

        test('should respect filters', async () => {
            const nearest: PortWithDistance | null = await findNearestPort(1.29, 103.85, { country_code: 'NL' });
            expect(nearest).not.toBeNull();
            expect(nearest!.country_code).toBe('NL');
        });
    });

    describe('findPorts', () => {
        test('should combine filters with AND logic', async () => {
            const ports: Port[] = await findPorts({ country_code: 'SG', harbor_size: 'Large' });
            expect(ports.every(p => p.country_code === 'SG' && p.harbor_size === 'Large')).toBe(true);
        });

        test('should throw on an unrecognized filter key', async () => {
            await expect(findPorts({ bogus_key: 'x' } as never)).rejects.toThrow();
        });
    });

    describe('getPortCount', () => {
        test('should count matching ports', async () => {
            const count: number = await getPortCount({ country_code: 'SG' });
            const ports: Port[] = await getPortsByCountryCode('SG');
            expect(count).toBe(ports.length);
        });
    });

    describe('getMultiplePorts', () => {
        test('should resolve multiple LOCODEs in order, with null for unknowns', async () => {
            const results: (Port | null)[] = await getMultiplePorts(['SGKEP', 'ZZZZZ']);
            expect(results[0]?.locode).toBe('SGKEP');
            expect(results[1]).toBeNull();
        });
    });

    describe('calculateDistance', () => {
        test('should compute a positive distance between two known ports', async () => {
            const distance: number | null = await calculateDistance('SGKEP', 'NLRTM');
            expect(distance).not.toBeNull();
            expect(distance as number).toBeGreaterThan(1000);
        });

        test('should return null for an unknown port', async () => {
            const distance: number | null = await calculateDistance('SGKEP', 'ZZZZZ');
            expect(distance).toBeNull();
        });
    });

    describe('calculateDistanceMatrix', () => {
        test('should build a symmetric matrix', async () => {
            const matrix: DistanceMatrix = await calculateDistanceMatrix(['SGKEP', 'NLRTM']);
            expect(matrix.distances['SGKEP']['NLRTM']).toBe(matrix.distances['NLRTM']['SGKEP']);
            expect(matrix.distances['SGKEP']['SGKEP']).toBe(0);
        });
    });

    describe('getPortStatsByCountry', () => {
        test('should aggregate stats for a country', async () => {
            const stats: PortCountryStats = await getPortStatsByCountry('SG');
            expect(stats.total).toBeGreaterThan(0);
            const sizeSum = Object.values(stats.byHarborSize).reduce((a, b) => a + b, 0);
            expect(sizeSum).toBeLessThanOrEqual(stats.total);
        });
    });

    describe('validateLocode', () => {
        test('should return true for a known LOCODE', async () => {
            expect(await validateLocode('SGKEP')).toBe(true);
        });

        test('should return false for a malformed or unknown code', async () => {
            expect(await validateLocode('X')).toBe(false);
            expect(await validateLocode('ZZZZZ')).toBe(false);
        });
    });
});
