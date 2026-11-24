function buildFkReadConfig(tableName, displayFields, fkMappings) {
    const alias = 't';
    const joins = [];
    const columnMap = { id: `${alias}.\`id\`` };
    let aliasIndex = 0;

    displayFields.forEach(field => {
        const fk = fkMappings && fkMappings[field];
        if (fk) {
            const sourceColumn = fk.targetField || field;
            aliasIndex += 1;
            const fkAlias = `fk${aliasIndex}`;
            const lookupColumn = fk.column || 'name';
            joins.push(`LEFT JOIN \`${fk.table}\` ${fkAlias} ON ${alias}.\`${sourceColumn}\` = ${fkAlias}.id`);
            columnMap[field] = `${fkAlias}.\`${lookupColumn}\``;
        } else {
            columnMap[field] = `${alias}.\`${field}\``;
        }
    });

    return {
        fromClause: `\`${tableName}\` ${alias} ${joins.join(' ')}`,
        columnMap
    };
}

const MASTER_CONFIG = {
    itemMaster: {
        tableName: 'items',
        primaryKey: 'id',
        fields: [
            'itemCode', 'itemName', 'itemGroup', 'inActive', 'uom', 'stdRate', 'gstCategory',
            'minStockLvl', 'maxLvl', 'underLedger', 'reorder', 'rol', 'roq', 'shelfLifeItem',
            'hsnCode', 'critical', 'mainLocation', 'productFinish', 'productFamily',
            'category', 'fimId', 'grossWeight', 'netWeight', 'scrapWeight',
            'rmItemCode', 'rmThickness', 'rmWidth', 'rmLength',
            'stockControl', 'material', 'materialThickness', 'jcPart', 'nonStockable'
        ],
        displayFields: [
            'itemCode', 'itemName', 'itemGroup', 'inActive', 'uom', 'stdRate', 'gstCategory',
            'minStockLvl', 'maxLvl', 'underLedger', 'reorder', 'rol', 'roq', 'shelfLifeItem',
            'hsnCode', 'critical', 'mainLocation', 'productFinish', 'productFamily',
            'category', 'fim', 'grossWeight', 'netWeight', 'scrapWeight',
            'rmItemCode', 'rmThickness', 'rmWidth', 'rmLength',
            'stockControl', 'material', 'materialThickness', 'jcPart', 'nonStockable'
        ],
        booleanFields: ['inActive', 'nonStockable'],
        fkMappings: {
            itemGroup: { table: 'mst_item_group', label: 'Item Group', strict: true },
            uom: { table: 'mst_uom', label: 'UOM', strict: true },
            hsnCode: { table: 'item_hsn_code', label: 'HSN', strict: true },
            mainLocation: { table: 'item_main_loc', label: 'Location', strict: true },
            productFinish: { table: 'item_product_finish', label: 'Finish', strict: true },
            productFamily: { table: 'item_product_family', label: 'Product Family', strict: true },
            fim: { table: 'item_fim_id', targetField: 'fimId', label: 'FIM', strict: true },
            underLedger: { table: 'item_under_ledger', label: 'Ledger', strict: true }
        },
        excelAliases: {
            'fim': 'fim'
        },
        postUpdate: async (conn) => {
            const { incCacheVersion } = require('../controllers/itemController');
            await incCacheVersion();
        }
    },
    bom: {
        tableName: 'bom',
        primaryKey: 'id',
        trackUpdates: false,
        fields: ['Qty', 'jcPart', 'itemCode', 'itemId'],
        displayFields: ['bomItemCode', 'itemCode', 'Qty', 'jcPart'],
        fromClause: '`bom` b LEFT JOIN `bom_mst` m ON b.bomMstId = m.id',
        columnMap: {
            id: 'b.id',
            bomItemCode: 'm.itemCode',
            itemCode: 'b.itemCode',
            Qty: 'b.Qty',
            jcPart: 'b.jcPart'
        },
        fkMappings: {
            itemCode: { table: 'items', column: 'itemCode', targetField: 'itemId', label: 'Item Code', alwaysResolve: true, strict: true }
        },
        excelAliases: {
            'bomitemcode': 'bomItemCode',
            'itemcode': 'itemCode'
        },
        validateRow: (rowData) => {
            if (!rowData.bomItemCode || !rowData.itemCode) {
                if (!rowData.id) {
                    rowData.status = 'ERROR';
                    rowData.errors.push("BOM Item Code and Item Code are required");
                }
            }
        },
        resolveId: async (conn, data) => {
            const pairs = data.filter(r => r.bomItemCode && r.itemCode && !r.id);
            if (pairs.length === 0) return;

            const chunkArray = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));

            // Fetch BOM (parent) item IDs
            const bomItemCodes = [...new Set(pairs.map(r => r.bomItemCode))];
            const mainMap = new Map();
            if (bomItemCodes.length > 0) {
                for (const chunk of chunkArray(bomItemCodes, 5000)) {
                    const [rows] = await conn.query('SELECT id, itemCode FROM bom_mst WHERE itemCode IN (?)', [chunk]);
                    rows.forEach(r => mainMap.set(r.itemCode, r.id));
                }
            }

            // Fetch child item IDs
            const childCodes = [...new Set(pairs.map(r => r.itemCode))];
            const childMap = new Map();
            if (childCodes.length > 0) {
                for (const chunk of chunkArray(childCodes, 5000)) {
                    const [rows] = await conn.query('SELECT id, itemCode FROM items WHERE itemCode IN (?)', [chunk]);
                    rows.forEach(r => childMap.set(r.itemCode, r.id));
                }
            }

            const bomLookups = [];
            for (const row of pairs) {
                const mstId = mainMap.get(row.bomItemCode);
                const itemId = childMap.get(row.itemCode);
                if (mstId && itemId) {
                    bomLookups.push({ row, mstId, itemId });
                } else {
                    row.status = 'ERROR';
                    row.errors.push(`Main or Child item not found in master.`);
                }
            }

            if (bomLookups.length === 0) return;

            // Instead of tuple IN clauses which are slow in MySQL, fetch all BOMs for the involved main items.
            const uniqueMstIds = [...new Set(bomLookups.map(l => l.mstId))];
            const bomMap = new Map();

            for (const chunk of chunkArray(uniqueMstIds, 2000)) {
                const [bomRows] = await conn.query(`SELECT id, bomMstId, itemId FROM bom WHERE bomMstId IN (?)`, [chunk]);
                bomRows.forEach(r => bomMap.set(`${r.bomMstId}-${r.itemId}`, r.id));
            }

            for (const lookup of bomLookups) {
                const key = `${lookup.mstId}-${lookup.itemId}`;
                const bomId = bomMap.get(key);
                if (bomId) {
                    lookup.row.id = bomId;
                } else {
                    lookup.row.status = 'ERROR';
                    lookup.row.errors.push(`BOM record not found for this main-child combination.`);
                }
            }
        }
    }
};

// Wire up FK-name joins for reads (getMasterData/exportMasterData), derived from itemMaster's
Object.assign(
    MASTER_CONFIG.itemMaster,
    buildFkReadConfig('items', MASTER_CONFIG.itemMaster.displayFields, MASTER_CONFIG.itemMaster.fkMappings)
);

// --- DYNAMIC REGISTRATION FOR SIMPLE MASTERS ---
const { collection: masters } = require('../utility/master');

const generalFieldsMap = {
    currency: ['code', 'name', 'description'],
    customerGroup: ['code', 'name', 'description'],
    pm: ['code', 'name', 'vendorProcess', 'description'],
    machine: ['code', 'name', 'description'],
    role: ['code', 'name', 'description'],
    department: ['code', 'name', 'description'],
    sp: ['code', 'name', 'description'],
    dtr: ['code', 'name', 'description'],
    section: ['name', 'description'],
    city: ['code', 'countryId', 'stateId', 'name', 'description'],
    state: ['code', 'countryId', 'name', 'description'],
    country: ['code', 'name', 'description'],
    supplierGroup: ['code', 'name', 'description'],
    tool: ['code', 'name', 'description'],
    uom: ['code', 'name', 'description'],
    supplyType: ['name', 'description'],
    gstinOrUin: ['name', 'description'],
    placeOfSupply: ['name', 'description', 'stateCode'],
    designation: ['code', 'name', 'description'],
    itemGroup: ['code', 'name', 'description', 'chapterHdr', 'isstoreGroup'],
    tarrif: ['code', 'name', 'description'],
    trf: ['code', 'name', 'description'],
    orderType: ['orderType', 'description'],
    menu: ['type', 'code', 'name', 'description'],
    location: ['country', 'state', 'city', 'description'],
    displayName: ['code', 'name', 'description'],
    inspectionLevel: ['code', 'name', 'description'],
    problemCategory: ['name', 'description'],
    natureOfProblem: ['name', 'description'],
    underLedger: ['code', 'name', 'description'],
    reorder : ['name', 'description'],
    mainLocation : ['name', 'description'],
    hsnCode : ['name', 'description'],
    subLocation : ['name', 'description'],
    productFinish : ['name', 'description'],
    productFamily : ['name', 'description'],
    category : ['name', 'description'],
    fim : ['name', 'description', 'packingCharge'],
    rmItemcode : ['name', 'description'],
    product: ['name', 'description']
};

Object.keys(generalFieldsMap).forEach(key => {
    if (masters[key]) {
        MASTER_CONFIG[key] = {
            tableName: masters[key].tbName,
            primaryKey: 'id',
            trackUpdates: false,
            fields: generalFieldsMap[key]
        };
    }
});

module.exports = MASTER_CONFIG;