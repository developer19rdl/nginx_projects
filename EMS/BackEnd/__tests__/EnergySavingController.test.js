/**
 * Test Suite: EnergySavingController
 * Covers: Energy Waste Detection CRUD + Corrective Action CRUD
 * Run:  npm test  (from Backend/)
 */

jest.mock('../app/config/dbSql2', () => ({
    connection: { execute: jest.fn() },
}));

const ctrl = require('../app/controllers/EnergySavingController');
const { connection } = require('../app/config/dbSql2');

// ─── helpers ────────────────────────────────────────────────────────────────

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const wasteBody = {
    detection_type: 'Overconsumption',
    asset_name: 'Pump A',
    meter_name: 'Meter 1',
    description: 'High energy detected',
    detected_value: 500,
    threshold_value: 400,
    detection_date: '2026-05-21',
    status: 'OPEN',
};

const corrBody = {
    condition_type: 'High Load',
    condition_description: 'Excessive draw detected',
    recommended_action: 'Reduce load by 20%',
    asset_name: 'Motor B',
    device_name: 'Device 3',
    priority: 'HIGH',
    status: 'PENDING',
    assigned_to: 'Engineer 1',
    action_date: '2026-05-25',
    energy_saved: 150,
};

// ────────────────────────────────────────────────────────────────────────────
// Energy Waste Detection
// ────────────────────────────────────────────────────────────────────────────

describe('EnergySavingController › wasteStore', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 200 and success message on successful insert', async () => {
        connection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = mockRes();
        await ctrl.wasteStore({ body: wasteBody }, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Energy waste record added successfully',
        });
    });

    it('returns 500 when affectedRows is 0', async () => {
        connection.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
        const res = mockRes();
        await ctrl.wasteStore({ body: wasteBody }, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json.mock.calls[0][0].success).toBe(false);
    });

    it('defaults status to OPEN when not provided', async () => {
        connection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = mockRes();
        const body = { detection_type: 'Voltage Drop' };
        await ctrl.wasteStore({ body }, res);
        const params = connection.execute.mock.calls[0][1];
        expect(params[7]).toBe('OPEN');
    });

    it('stores null for optional fields when omitted', async () => {
        connection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = mockRes();
        await ctrl.wasteStore({ body: { detection_type: 'X' } }, res);
        const params = connection.execute.mock.calls[0][1];
        expect(params[1]).toBeNull(); // asset_name
        expect(params[2]).toBeNull(); // meter_name
        expect(params[3]).toBeNull(); // description
    });

    it('returns 500 on database error', async () => {
        connection.execute.mockRejectedValueOnce(new Error('DB connection failed'));
        const res = mockRes();
        await ctrl.wasteStore({ body: wasteBody }, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'DB connection failed',
        });
    });
});

describe('EnergySavingController › wasteShow', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 200 with all waste records', async () => {
        const rows = [
            { id: 1, detection_type: 'Overconsumption', status: 'OPEN', created_at: '2026-05-21' },
            { id: 2, detection_type: 'Voltage Drop', status: 'CLOSED', created_at: '2026-05-20' },
        ];
        connection.execute.mockResolvedValueOnce([rows]);
        const res = mockRes();
        await ctrl.wasteShow({}, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, data: rows });
    });

    it('returns 200 with empty array when no records exist', async () => {
        connection.execute.mockResolvedValueOnce([[]]);
        const res = mockRes();
        await ctrl.wasteShow({}, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, data: [] });
    });

    it('returns 500 on database error', async () => {
        connection.execute.mockRejectedValueOnce(new Error('Query failed'));
        const res = mockRes();
        await ctrl.wasteShow({}, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json.mock.calls[0][0].success).toBe(false);
    });
});

describe('EnergySavingController › wasteUpdate', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 200 when record is updated successfully', async () => {
        connection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = mockRes();
        await ctrl.wasteUpdate({ params: { id: '1' }, body: wasteBody }, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Energy waste record updated successfully',
        });
    });

    it('returns 404 when record is not found', async () => {
        connection.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
        const res = mockRes();
        await ctrl.wasteUpdate({ params: { id: '999' }, body: wasteBody }, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Record not found',
        });
    });

    it('returns 500 on database error', async () => {
        connection.execute.mockRejectedValueOnce(new Error('Update failed'));
        const res = mockRes();
        await ctrl.wasteUpdate({ params: { id: '1' }, body: wasteBody }, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('EnergySavingController › wasteDelete', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 200 when record is deleted successfully', async () => {
        connection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = mockRes();
        await ctrl.wasteDelete({ params: { id: '1' } }, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Energy waste record deleted successfully',
        });
    });

    it('returns 404 when record does not exist', async () => {
        connection.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
        const res = mockRes();
        await ctrl.wasteDelete({ params: { id: '999' } }, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Record not found',
        });
    });

    it('returns 500 on database error', async () => {
        connection.execute.mockRejectedValueOnce(new Error('Delete failed'));
        const res = mockRes();
        await ctrl.wasteDelete({ params: { id: '1' } }, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ────────────────────────────────────────────────────────────────────────────
// Corrective Action Recommendations
// ────────────────────────────────────────────────────────────────────────────

describe('EnergySavingController › corrStore', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 200 and success message on successful insert', async () => {
        connection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = mockRes();
        await ctrl.corrStore({ body: corrBody }, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Corrective action added successfully',
        });
    });

    it('defaults priority to MEDIUM when not provided', async () => {
        connection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = mockRes();
        const body = { condition_type: 'Low PF', recommended_action: 'Add capacitor bank' };
        await ctrl.corrStore({ body }, res);
        const params = connection.execute.mock.calls[0][1];
        expect(params[5]).toBe('MEDIUM');
    });

    it('defaults status to PENDING when not provided', async () => {
        connection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = mockRes();
        const body = { condition_type: 'Low PF', recommended_action: 'Add capacitor bank' };
        await ctrl.corrStore({ body }, res);
        const params = connection.execute.mock.calls[0][1];
        expect(params[6]).toBe('PENDING');
    });

    it('returns 500 when affectedRows is 0', async () => {
        connection.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
        const res = mockRes();
        await ctrl.corrStore({ body: corrBody }, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json.mock.calls[0][0].success).toBe(false);
    });

    it('returns 500 on database error', async () => {
        connection.execute.mockRejectedValueOnce(new Error('Insert failed'));
        const res = mockRes();
        await ctrl.corrStore({ body: corrBody }, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Insert failed',
        });
    });
});

describe('EnergySavingController › corrShow', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 200 with all corrective actions', async () => {
        const rows = [
            { id: 1, condition_type: 'High Load', status: 'PENDING' },
            { id: 2, condition_type: 'Low PF', status: 'COMPLETED' },
        ];
        connection.execute.mockResolvedValueOnce([rows]);
        const res = mockRes();
        await ctrl.corrShow({}, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, data: rows });
    });

    it('returns 200 with empty array when no records exist', async () => {
        connection.execute.mockResolvedValueOnce([[]]);
        const res = mockRes();
        await ctrl.corrShow({}, res);
        expect(res.json).toHaveBeenCalledWith({ success: true, data: [] });
    });

    it('returns 500 on database error', async () => {
        connection.execute.mockRejectedValueOnce(new Error('Query failed'));
        const res = mockRes();
        await ctrl.corrShow({}, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('EnergySavingController › corrUpdate', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 200 when corrective action is updated', async () => {
        connection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = mockRes();
        await ctrl.corrUpdate({ params: { id: '2' }, body: corrBody }, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Corrective action updated successfully',
        });
    });

    it('returns 404 when action not found', async () => {
        connection.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
        const res = mockRes();
        await ctrl.corrUpdate({ params: { id: '999' }, body: corrBody }, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Record not found',
        });
    });

    it('returns 500 on database error', async () => {
        connection.execute.mockRejectedValueOnce(new Error('Update error'));
        const res = mockRes();
        await ctrl.corrUpdate({ params: { id: '1' }, body: corrBody }, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});

describe('EnergySavingController › corrDelete', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 200 when corrective action is deleted', async () => {
        connection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const res = mockRes();
        await ctrl.corrDelete({ params: { id: '1' } }, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Corrective action deleted successfully',
        });
    });

    it('returns 404 when action not found', async () => {
        connection.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
        const res = mockRes();
        await ctrl.corrDelete({ params: { id: '999' } }, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Record not found',
        });
    });

    it('returns 500 on database error', async () => {
        connection.execute.mockRejectedValueOnce(new Error('Delete error'));
        const res = mockRes();
        await ctrl.corrDelete({ params: { id: '1' } }, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Delete error',
        });
    });
});
