/**
 * Test Suite: Energy Service Functions (NodeJsApiServices.js)
 * Covers: EnergyconsumptionService, KwhEnergyService, GetEnergyDataListService,
 *         GeneratorListService, MachineListService, MeterDataOnOffStatus,
 *         EnergyReportService, getTopFiveEnergyReport, getEnergyGraphReport
 * Run:  npm test  (from frontend/)
 */

import {
    EnergyconsumptionService,
    KwhEnergyService,
    GetEnergyDataListService,
    GeneratorListService,
    MachineListService,
    MeterDataOnOffStatus,
    EnergyReportService,
    getTopFiveEnergyReport,
    getEnergyGraphReport,
} from '../Services/NodeJsApiServices';

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('../utils/localStorageUtil', () => () => ({
    getStorage: jest.fn(() => ({
        token: 'test-token-123',
        userDetails: { companyCode: 'RDL' },
    })),
    clearStorage: jest.fn(),
}));

process.env.REACT_APP_EMS_API_URL = 'http://localhost:8000/api/';

// ─── fetch helpers ───────────────────────────────────────────────────────────

const mockFetchSuccess = (data, status = 200) => {
    global.fetch = jest.fn().mockResolvedValueOnce({
        status,
        json: jest.fn().mockResolvedValueOnce(data),
    });
};

const mockFetchError = (status, errorMessage) => {
    global.fetch = jest.fn().mockResolvedValueOnce({
        status,
        json: jest.fn().mockResolvedValueOnce({ message: errorMessage }),
    });
};

afterEach(() => {
    jest.clearAllMocks();
    delete global.fetch;
});

// ────────────────────────────────────────────────────────────────────────────
// EnergyconsumptionService — GET energy/
// ────────────────────────────────────────────────────────────────────────────

describe('EnergyconsumptionService', () => {
    it('calls successCallback with response data on 200', async () => {
        const mockData = {
            success: true,
            message: 'Last 30 days energy consumption',
            data: [{ date: '2026-05-21', energyConsum: 120, avgConsum: 90 }],
        };
        mockFetchSuccess(mockData);
        const onSuccess = jest.fn();
        const onError = jest.fn();

        await EnergyconsumptionService(onSuccess, onError);

        expect(onSuccess).toHaveBeenCalledWith(mockData);
        expect(onError).not.toHaveBeenCalled();
    });

    it('calls correct API endpoint with GET method', async () => {
        mockFetchSuccess({ success: true, data: [] });
        const onSuccess = jest.fn();

        await EnergyconsumptionService(onSuccess, jest.fn());

        const [url, options] = global.fetch.mock.calls[0];
        expect(url).toBe('http://localhost:8000/api/energy');
        expect(options.method).toBe('GET');
    });

    it('includes Bearer token in Authorization header', async () => {
        mockFetchSuccess({ success: true, data: [] });
        const onSuccess = jest.fn();

        await EnergyconsumptionService(onSuccess, jest.fn());

        const [, options] = global.fetch.mock.calls[0];
        expect(options.headers.authorization).toBe('Bearer test-token-123');
    });

    it('calls errorCallback on 401 response', async () => {
        mockFetchError(401, 'Unable to access the page, Token Expired');
        const onSuccess = jest.fn();
        const onError = jest.fn();

        await EnergyconsumptionService(onSuccess, onError);

        expect(onSuccess).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith(401, 'Unable to access the page, Token Expired');
    });

    it('calls errorCallback on 500 response', async () => {
        mockFetchError(500, 'Internal Server Error');
        const onError = jest.fn();

        await EnergyconsumptionService(jest.fn(), onError);

        expect(onError).toHaveBeenCalledWith(500, 'Internal Server Error');
    });
});

// ────────────────────────────────────────────────────────────────────────────
// KwhEnergyService — GET energy/24HourEnergyTrend
// ────────────────────────────────────────────────────────────────────────────

describe('KwhEnergyService', () => {
    it('calls successCallback with 24-hour trend data on 200', async () => {
        const mockData = {
            success: true,
            message: 'Last 24 Hour Energy Consumption',
            data: [{ hour: '10AM', energyConsum: 45, avgConsum: 38 }],
        };
        mockFetchSuccess(mockData);
        const onSuccess = jest.fn();

        await KwhEnergyService(onSuccess, jest.fn());

        expect(onSuccess).toHaveBeenCalledWith(mockData);
    });

    it('hits the correct endpoint', async () => {
        mockFetchSuccess({ success: true, data: [] });
        await KwhEnergyService(jest.fn(), jest.fn());

        const [url] = global.fetch.mock.calls[0];
        expect(url).toBe('http://localhost:8000/api/energy/24HourEnergyTrend');
    });
});

// ────────────────────────────────────────────────────────────────────────────
// GetEnergyDataListService — GET energy/kebData
// ────────────────────────────────────────────────────────────────────────────

describe('GetEnergyDataListService', () => {
    it('calls successCallback with KEB data on 200', async () => {
        const mockData = {
            message: 'Live Machine Data',
            data: { kW: '12.5', pF: '0.9', kWh: '340.2' },
        };
        mockFetchSuccess(mockData);
        const onSuccess = jest.fn();

        await GetEnergyDataListService(onSuccess, jest.fn());

        expect(onSuccess).toHaveBeenCalledWith(mockData);
    });

    it('hits the correct endpoint', async () => {
        mockFetchSuccess({ data: {} });
        await GetEnergyDataListService(jest.fn(), jest.fn());

        const [url] = global.fetch.mock.calls[0];
        expect(url).toBe('http://localhost:8000/api/energy/kebData');
    });
});

// ────────────────────────────────────────────────────────────────────────────
// GeneratorListService — GET energy/genratorData
// ────────────────────────────────────────────────────────────────────────────

describe('GeneratorListService', () => {
    it('calls successCallback with generator data on 200', async () => {
        const mockData = { message: 'Generator Data', data: { kW: '5.0', kWh: '50.0' } };
        mockFetchSuccess(mockData);
        const onSuccess = jest.fn();

        await GeneratorListService(onSuccess, jest.fn());

        expect(onSuccess).toHaveBeenCalledWith(mockData);
    });

    it('hits the correct endpoint', async () => {
        mockFetchSuccess({});
        await GeneratorListService(jest.fn(), jest.fn());

        const [url] = global.fetch.mock.calls[0];
        expect(url).toBe('http://localhost:8000/api/energy/genratorData');
    });
});

// ────────────────────────────────────────────────────────────────────────────
// MachineListService — GET energy/meterDropDownList
// ────────────────────────────────────────────────────────────────────────────

describe('MachineListService', () => {
    it('calls successCallback with meter dropdown list on 200', async () => {
        const mockData = {
            message: 'Meter Lists',
            data: [{ id: 1, displayName: 'Main Incomer' }, { id: 2, displayName: 'Line 2' }],
        };
        mockFetchSuccess(mockData);
        const onSuccess = jest.fn();

        await MachineListService(onSuccess, jest.fn());

        expect(onSuccess).toHaveBeenCalledWith(mockData);
    });

    it('hits the correct endpoint', async () => {
        mockFetchSuccess({ data: [] });
        await MachineListService(jest.fn(), jest.fn());

        const [url] = global.fetch.mock.calls[0];
        expect(url).toBe('http://localhost:8000/api/energy/meterDropDownList');
    });
});

// ────────────────────────────────────────────────────────────────────────────
// MeterDataOnOffStatus — GET energy/meterDataOnOffStatus
// ────────────────────────────────────────────────────────────────────────────

describe('MeterDataOnOffStatus', () => {
    it('calls successCallback with meter on/off status on 200', async () => {
        const mockData = {
            message: 'Meter Online/Offline Status fetched successfully',
            onlineMetersCount: 5,
            offlineMetersCount: 2,
            totalMetersCount: 7,
            data: [],
        };
        mockFetchSuccess(mockData);
        const onSuccess = jest.fn();

        await MeterDataOnOffStatus(onSuccess, jest.fn());

        expect(onSuccess).toHaveBeenCalledWith(mockData);
    });

    it('hits the correct endpoint', async () => {
        mockFetchSuccess({});
        await MeterDataOnOffStatus(jest.fn(), jest.fn());

        const [url] = global.fetch.mock.calls[0];
        expect(url).toBe('http://localhost:8000/api/energy/meterDataOnOffStatus');
    });
});

// ────────────────────────────────────────────────────────────────────────────
// EnergyReportService — POST report/energyConsum
// ────────────────────────────────────────────────────────────────────────────

describe('EnergyReportService', () => {
    const reportPayload = {
        fromDate: '2026-05-01',
        toDate: '2026-05-21',
        meterId: 1,
    };

    it('calls successCallback with report data on 200', async () => {
        const mockData = {
            success: true,
            data: [{ date: '2026-05-01', kWh: 250 }],
        };
        mockFetchSuccess(mockData);
        const onSuccess = jest.fn();

        await EnergyReportService(reportPayload, onSuccess, jest.fn());

        expect(onSuccess).toHaveBeenCalledWith(mockData);
    });

    it('uses POST method', async () => {
        mockFetchSuccess({ success: true, data: [] });
        await EnergyReportService(reportPayload, jest.fn(), jest.fn());

        const [, options] = global.fetch.mock.calls[0];
        expect(options.method).toBe('POST');
    });

    it('hits the correct endpoint', async () => {
        mockFetchSuccess({ success: true, data: [] });
        await EnergyReportService(reportPayload, jest.fn(), jest.fn());

        const [url] = global.fetch.mock.calls[0];
        expect(url).toBe('http://localhost:8000/api/report/energyConsum');
    });

    it('sends payload in request body', async () => {
        mockFetchSuccess({ success: true, data: [] });
        await EnergyReportService(reportPayload, jest.fn(), jest.fn());

        const [, options] = global.fetch.mock.calls[0];
        expect(options.body).toBe(JSON.stringify(reportPayload));
    });

    it('calls errorCallback on 404 response', async () => {
        mockFetchError(404, 'Report data not found');
        const onError = jest.fn();

        await EnergyReportService(reportPayload, jest.fn(), onError);

        expect(onError).toHaveBeenCalledWith(404, 'Report data not found');
    });
});

// ────────────────────────────────────────────────────────────────────────────
// getTopFiveEnergyReport — POST report/top5energyData
// ────────────────────────────────────────────────────────────────────────────

describe('getTopFiveEnergyReport', () => {
    const payload = { fromDate: '2026-05-01', toDate: '2026-05-21' };

    it('calls successCallback on 200', async () => {
        const mockData = { success: true, data: [] };
        mockFetchSuccess(mockData);
        const onSuccess = jest.fn();

        await getTopFiveEnergyReport(payload, onSuccess, jest.fn());

        expect(onSuccess).toHaveBeenCalledWith(mockData);
    });

    it('uses POST and hits correct endpoint', async () => {
        mockFetchSuccess({ success: true, data: [] });
        await getTopFiveEnergyReport(payload, jest.fn(), jest.fn());

        const [url, options] = global.fetch.mock.calls[0];
        expect(url).toBe('http://localhost:8000/api/report/top5energyData');
        expect(options.method).toBe('POST');
    });
});

// ────────────────────────────────────────────────────────────────────────────
// getEnergyGraphReport — POST report/energydatagraph
// ────────────────────────────────────────────────────────────────────────────

describe('getEnergyGraphReport', () => {
    const payload = { fromDate: '2026-05-01', toDate: '2026-05-21', meterId: 2 };

    it('calls successCallback on 200', async () => {
        const mockData = { success: true, data: [] };
        mockFetchSuccess(mockData);
        const onSuccess = jest.fn();

        await getEnergyGraphReport(payload, onSuccess, jest.fn());

        expect(onSuccess).toHaveBeenCalledWith(mockData);
    });

    it('uses POST and hits correct endpoint', async () => {
        mockFetchSuccess({ success: true, data: [] });
        await getEnergyGraphReport(payload, jest.fn(), jest.fn());

        const [url, options] = global.fetch.mock.calls[0];
        expect(url).toBe('http://localhost:8000/api/report/energydatagraph');
        expect(options.method).toBe('POST');
    });
});
