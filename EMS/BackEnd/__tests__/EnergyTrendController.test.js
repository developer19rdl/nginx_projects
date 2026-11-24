/**
 * Test Suite: EnergyDashBoardEnergyTrendController
 * Covers: 30-day trend, 24-hour trend, EnergyMeterDataList, meterDropDownList
 * Run:  npm test  (from Backend/)
 */

jest.mock('../app/config/dbSql2', () => ({
    connection: { execute: jest.fn() },
    CustomError: class CustomError extends Error {
        constructor(message, statusCode) {
            super(message);
            this.statusCode = statusCode;
        }
    },
}));

jest.mock('../app/utility/utilityFunction', () => ({
    getMachineId: jest.fn(),
    getSolarMeterIds: jest.fn(),
    getWindmillMeterIds: jest.fn(),
}));

const ctrl = require('../app/controllers/EnergyDashBoardEnergyTrendController');
const { connection } = require('../app/config/dbSql2');
const { getMachineId } = require('../app/utility/utilityFunction');

// ─── helpers ────────────────────────────────────────────────────────────────

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const getJsonArg = (res) => res.json.mock.calls[0][0];

// ────────────────────────────────────────────────────────────────────────────
// Last30DaysEnergyConsumptionTrend
// ────────────────────────────────────────────────────────────────────────────

describe('EnergyTrendController › Last30DaysEnergyConsumptionTrend', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 200 with exactly 30 data points', async () => {
        getMachineId.mockResolvedValueOnce(5);
        connection.execute.mockResolvedValueOnce([[
            { date: '2026-05-21', energyConsum: '120.5' },
            { date: '2026-05-20', energyConsum: '98.3' },
        ]]);

        const res = mockRes();
        await ctrl.Last30DaysEnergyConsumptionTrend({}, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const body = getJsonArg(res);
        expect(body.success).toBe(true);
        expect(body.data).toHaveLength(30);
    });

    it('each item has date, energyConsum, and avgConsum fields', async () => {
        getMachineId.mockResolvedValueOnce(5);
        connection.execute.mockResolvedValueOnce([[
            { date: '2026-05-21', energyConsum: '100' },
        ]]);

        const res = mockRes();
        await ctrl.Last30DaysEnergyConsumptionTrend({}, res);

        const item = getJsonArg(res).data[0];
        expect(item).toHaveProperty('date');
        expect(item).toHaveProperty('energyConsum');
        expect(item).toHaveProperty('avgConsum');
    });

    it('fills missing dates with 0 consumption when DB returns no rows', async () => {
        getMachineId.mockResolvedValueOnce(5);
        connection.execute.mockResolvedValueOnce([[]]);

        const res = mockRes();
        await ctrl.Last30DaysEnergyConsumptionTrend({}, res);

        const data = getJsonArg(res).data;
        expect(data.every((d) => d.energyConsum === 0)).toBe(true);
        expect(data.every((d) => d.avgConsum === 0)).toBe(true);
    });

    it('calculates avgConsum as Math.round(total / 30)', async () => {
        getMachineId.mockResolvedValueOnce(5);
        // Single day with 300 kWh; avg = Math.round(300/30) = 10
        connection.execute.mockResolvedValueOnce([[
            { date: '2026-05-21', energyConsum: '300' },
        ]]);

        const res = mockRes();
        await ctrl.Last30DaysEnergyConsumptionTrend({}, res);

        const data = getJsonArg(res).data;
        expect(data.every((d) => d.avgConsum === 10)).toBe(true);
    });

    it('all 30 entries share the same avgConsum value', async () => {
        getMachineId.mockResolvedValueOnce(5);
        connection.execute.mockResolvedValueOnce([[
            { date: '2026-05-21', energyConsum: '600' },
            { date: '2026-05-20', energyConsum: '600' },
        ]]);

        const res = mockRes();
        await ctrl.Last30DaysEnergyConsumptionTrend({}, res);

        const data = getJsonArg(res).data;
        const firstAvg = data[0].avgConsum;
        expect(data.every((d) => d.avgConsum === firstAvg)).toBe(true);
    });

    it('returns 500 when getMachineId throws', async () => {
        getMachineId.mockRejectedValueOnce(new Error('DB error'));

        const res = mockRes();
        await ctrl.Last30DaysEnergyConsumptionTrend({}, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(getJsonArg(res).success).toBe(false);
    });

    it('returns 500 when connection.execute throws', async () => {
        getMachineId.mockResolvedValueOnce(5);
        connection.execute.mockRejectedValueOnce(new Error('Query error'));

        const res = mockRes();
        await ctrl.Last30DaysEnergyConsumptionTrend({}, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// Last24HourEnergyConsumptionTrend
// ────────────────────────────────────────────────────────────────────────────

describe('EnergyTrendController › Last24HourEnergyConsumptionTrend', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 200 with exactly 24 data points', async () => {
        getMachineId.mockResolvedValueOnce(5);
        connection.execute.mockResolvedValueOnce([[
            { energyConsum: '45.2', HR: '10AM', created_at: '2026-05-21 10:30:00' },
        ]]);

        const res = mockRes();
        await ctrl.Last24HourEnergyConsumptionTrend({}, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const body = getJsonArg(res);
        expect(body.success).toBe(true);
        expect(body.data).toHaveLength(24);
    });

    it('each item has hour, energyConsum, and avgConsum fields', async () => {
        getMachineId.mockResolvedValueOnce(5);
        connection.execute.mockResolvedValueOnce([[]]);

        const res = mockRes();
        await ctrl.Last24HourEnergyConsumptionTrend({}, res);

        const item = getJsonArg(res).data[0];
        expect(item).toHaveProperty('hour');
        expect(item).toHaveProperty('energyConsum');
        expect(item).toHaveProperty('avgConsum');
    });

    it('fills all 24 hours with 0 when DB returns no rows', async () => {
        getMachineId.mockResolvedValueOnce(5);
        connection.execute.mockResolvedValueOnce([[]]);

        const res = mockRes();
        await ctrl.Last24HourEnergyConsumptionTrend({}, res);

        const data = getJsonArg(res).data;
        expect(data).toHaveLength(24);
        expect(data.every((d) => d.energyConsum === 0)).toBe(true);
    });

    it('avgConsum is 0 when total consumption is 0', async () => {
        getMachineId.mockResolvedValueOnce(5);
        connection.execute.mockResolvedValueOnce([[]]);

        const res = mockRes();
        await ctrl.Last24HourEnergyConsumptionTrend({}, res);

        const data = getJsonArg(res).data;
        expect(data.every((d) => d.avgConsum === 0)).toBe(true);
    });

    it('returns 500 when getMachineId throws', async () => {
        getMachineId.mockRejectedValueOnce(new Error('Timeout'));

        const res = mockRes();
        await ctrl.Last24HourEnergyConsumptionTrend({}, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(getJsonArg(res).success).toBe(false);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// EnergyMeterDataList
// ────────────────────────────────────────────────────────────────────────────

describe('EnergyTrendController › EnergyMeterDataList', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 400 when no filter params are provided', async () => {
        const res = mockRes();
        await ctrl.EnergyMeterDataList({ body: {} }, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(getJsonArg(res)).toMatchObject({
            success: false,
            message: 'Please provide plantId, distributerId, or feederId',
        });
    });

    it('returns 404 when no Asset meters are found', async () => {
        connection.execute.mockResolvedValueOnce([[]]); // empty meters

        const res = mockRes();
        await ctrl.EnergyMeterDataList({ body: { plantId: 1 } }, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 200 with meter data filtered by feederId', async () => {
        const meters = [{
            id: 1, slaveId: 'S1', meterType: 'Asset', feederId: 10,
            displayName: 'Meter A', deviceId: 'D1', plantId: 1, valueKW: 50,
        }];

        connection.execute
            .mockResolvedValueOnce([meters])                    // meters query
            .mockResolvedValueOnce([[{ kWh: 10 }]])              // energy kWh
            .mockResolvedValueOnce([[{ pF: '0.95' }]])           // pF
            .mockResolvedValueOnce([[{ kW: '5.2' }]]);           // kW

        const res = mockRes();
        await ctrl.EnergyMeterDataList({ body: { feederId: 10 } }, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const body = getJsonArg(res);
        expect(body.data).toHaveLength(1);
        expect(body.data[0].displayName).toBe('Meter A');
        expect(body.data[0].kWvalue).toBe(10);
    });

    it('returns 200 with meter data filtered by distributerId', async () => {
        const meters = [{
            id: 2, slaveId: 'S2', meterType: 'Asset', feederId: null,
            displayName: 'Meter B', deviceId: 'D2', plantId: 1, valueKW: 80,
        }];

        connection.execute
            .mockResolvedValueOnce([meters])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[]]);

        const res = mockRes();
        await ctrl.EnergyMeterDataList({ body: { distributerId: 5 } }, res);

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('sets pFvalue to null when pF query returns empty', async () => {
        const meters = [{
            id: 3, slaveId: 'S3', meterType: 'Asset',
            displayName: 'Meter C', deviceId: 'D3', plantId: 1, valueKW: 30,
        }];

        connection.execute
            .mockResolvedValueOnce([meters])
            .mockResolvedValueOnce([[]])   // no energy data
            .mockResolvedValueOnce([[]])   // no pF data
            .mockResolvedValueOnce([[]]); // no kW data

        const res = mockRes();
        await ctrl.EnergyMeterDataList({ body: { plantId: 1 } }, res);

        const item = getJsonArg(res).data[0];
        expect(item.pFvalue).toBeNull();
        expect(item.kW).toBeNull();
    });

    it('returns 500 on database error', async () => {
        connection.execute.mockRejectedValueOnce(new Error('Query timeout'));

        const res = mockRes();
        await ctrl.EnergyMeterDataList({ body: { feederId: 10 } }, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// meterDropDownList
// ────────────────────────────────────────────────────────────────────────────

describe('EnergyTrendController › meterDropDownList', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 200 with meters list', async () => {
        const metersList = [
            { id: 1, displayName: 'Main Incomer' },
            { id: 2, displayName: 'Line 2' },
        ];
        connection.execute.mockResolvedValueOnce([metersList]);

        const res = mockRes();
        await ctrl.meterDropDownList({}, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const body = getJsonArg(res);
        expect(body.data).toEqual(metersList);
        expect(body.message).toBe('Meter Lists');
    });

    it('returns 406 when no meters exist', async () => {
        connection.execute.mockResolvedValueOnce([[]]);

        const res = mockRes();
        await ctrl.meterDropDownList({}, res);

        expect(res.status).toHaveBeenCalledWith(406);
        expect(getJsonArg(res).message).toBe('Meters not found');
    });

    it('returns 406 on database error', async () => {
        connection.execute.mockRejectedValueOnce(new Error('Connection lost'));

        const res = mockRes();
        await ctrl.meterDropDownList({}, res);

        expect(res.status).toHaveBeenCalledWith(406);
    });
});
