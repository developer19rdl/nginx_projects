
const { connection } = require('../config/dbSql2');

// Run Database/migration_energy_tariff.sql to create the energy_tariff table.

exports.store = async (req, res) => {
    try {
        const { energyCostPerUnit, generatorFuelCostPerLtr } = req.body;
        if (energyCostPerUnit === undefined || energyCostPerUnit === '') {
            throw new Error('energyCostPerUnit is required');
        }

        const storeQuery = `INSERT INTO energy_tariff (energyCostPerUnit, generatorFuelCostPerLtr) VALUES (?, ?)`;
        const values = [energyCostPerUnit, generatorFuelCostPerLtr || null];

        const [sRows] = await connection.execute(storeQuery, values);

        if (sRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Tariff added successfully" });
        } else {
            throw new Error("Something went wrong!");
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occured' });
    }
};



exports.show = async (req, res) => {
    try {
        const showQuery = `SELECT * FROM energy_tariff ORDER BY createdAt DESC`;
        const [rows] = await connection.execute(showQuery);

        return res.status(200).json({ success: true, data: rows });

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { energyCostPerUnit, generatorFuelCostPerLtr } = req.body;
        if (energyCostPerUnit === undefined || energyCostPerUnit === '') {
            throw new Error('energyCostPerUnit is required');
        }

        const updateQuery = `
            UPDATE energy_tariff
            SET
                energyCostPerUnit = ?,
                generatorFuelCostPerLtr = ?
            WHERE
                id = ?
        `;
        const values = [
            energyCostPerUnit,
            generatorFuelCostPerLtr || null,
            id
        ];

        const [result] = await connection.execute(updateQuery, values);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Tariff updated successfully" });
        } else {
            return res.status(404).json({ success: false, message: "Tariff not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const deleteQuery = `DELETE FROM energy_tariff WHERE id = ?`;
        const [result] = await connection.execute(deleteQuery, [id]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Tariff deleted successfully" });
        } else {
            return res.status(404).json({ success: false, message: "Tariff not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
