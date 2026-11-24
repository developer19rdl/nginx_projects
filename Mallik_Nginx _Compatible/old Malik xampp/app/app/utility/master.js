const collection = {
    currency: {
        mstLable: 'Currency',
        tbName: 'mst_currency',
        colName: 'code',
        fields: ['code', 'name', 'description'],
    },
    customerGroup: {
        mstLable: 'Customer group',
        tbName: 'mst_cust_group',
        colName: 'name',
        fields: ['code', 'name', 'description'],
    },
    pm: {
        mstLable: 'PM',
        tbName: 'mst_pm',
        colName: 'name',
        fields: ['code', 'name', 'vendorProcess', 'description'],
    },
    machine: {
        mstLable: 'machine',
        tbName: 'mst_machine',
        colName: 'name',
        fields: ['code', 'name', 'description'],
    },
    role: {
        mstLable: 'Role',
        tbName: 'mst_role',
        colName: 'name',
        fields: ['code', 'name', 'description'],
    },
    department: {
        mstLable: 'Department',
        tbName: 'mst_department',
        colName: 'name',
        fields: ['code', 'name', 'description'],
    },
    sp: {
        mstLable: 'SP',
        tbName: 'mst_sp',
        colName: 'name',
        fields: ['code', 'name', 'description'],
    },
    dtr: {
        mstLable: 'DTR',
        tbName: 'mst_dtr',
        colName: 'name',
        fields: ['code', 'name', 'description'],
    },
    section: {
        mstLable: 'Section',
        tbName: 'mst_section',
        colName: 'name',
        fields: ['name', 'description'],
    },
    city: {
        mstLable: 'City',
        tbName: 'mst_city',
        colName: 'name',
        fields: ['code', 'countryId', 'stateId', 'name', 'description'],
    },
    state: {
        mstLable: 'State',
        tbName: 'mst_state',
        colName: 'name',
        fields: ['code', 'countryId', 'name', 'description'],
    },
    country: {
        mstLable: 'Country',
        tbName: 'mst_country',
        colName: 'name',
        fields: ['code', 'name', 'description'],
    },
    supplierGroup: {
        mstLable: 'Supplier group',
        tbName: 'mst_sup_group',
        colName: 'name',
        fields: ['code', 'name', 'description'],
    },
    tool: {
        mstLable: 'Tool',
        tbName: 'mst_tool',
        colName: 'name',
        fields: ['code', 'name', 'description'],
    },
    uom: {
        mstLable: 'UOM',
        tbName: 'mst_uom',
        colName: 'name',
        fields: ['code', 'name', 'description'],
    },
    supplyType: {
        mstLable: 'Supply type',
        tbName: 'mst_sup_type',
        colName: 'name',
        fields: ['name', 'description'],
    },
    gstinOrUin: {
        mstLable: 'GSTIN',
        tbName: 'mst_gstin_uin',
        colName: 'name',
        fields: ['name', 'description'],
    },
    placeOfSupply: {
        mstLable: 'Place of Supply',
        tbName: 'mst_sup_place',
        colName: 'name',
        fields: ['name', 'description', 'stateCode'],
        defaults: { stateCode: null },
    },
    designation: {
        mstLable: 'Designation',
        tbName: 'mst_designation',
        colName: 'name',
        fields: ['code', 'name',  'description'],
    },
    itemGroup: {
        mstLable: 'Item group',
        tbName: 'mst_item_group',
        colName: 'name',
        fields: ['code', 'name',  'description', 'chapterHdr', 'isstoreGroup'],
    },
    tarrif: {
        mstLable: 'Tarrif',
        tbName: 'mst_tarrif',
        colName: 'name',
        fields: ['code', 'name',  'description'],
    },
    trf: {
        mstLable: 'TRF',
        tbName: 'mst_trf',
        colName: 'name',
        fields: ['code', 'name',  'description'],
    },
    orderType: {
        mstLable: 'Order type',
        tbName: 'orderTypes',
        colName: 'orderType',
        fields: ['orderType', 'description'],
    },
    menu: {
        mstLable: 'Menu',
        tbName: 'mst_menu',
        colName: 'name',
        fields: ['type', 'code', 'name',  'description'],
    },
    location: {
        mstLable: 'Location',
        tbName: 'mst_location',
        colName: 'name',
        fields: ['country', 'state', 'city', 'description'],
        defaults: { description: null },
    },
    displayName: {
        mstLable: 'Display Name',
        tbName: 'mst_display_name',
        colName: 'name',
        fields: ['code', 'name',  'description'],
    },
    inspectionLevel: {
        mstLable: 'Inspection Level',
        tbName: 'mst_inspection_level',
        colName: 'name',
        fields: ['code', 'name',  'description'],
    },
    problemCategory: {
        mstLable: 'Problem Category',
        tbName: 'problem_category',
        colName: 'name',
        fields: ['name', 'description'],
    },
    natureOfProblem: {
        mstLable: 'Nature of Problem',
        tbName: 'nature_of_problem',
        colName: 'name',
        fields: ['name', 'description'],
    },
    cellMaster: {
        mstLable: 'Cell Master',
        tbName: 'cell_master',
        colName: 'name',
        fields: ['name', 'description'],
    },
    underLedger: {
        mstLable: 'Under ledger',
        tbName: 'item_under_ledger',
        colName: 'name',
        fields: ['code', 'name', 'description'],
    },
    reorder: {
        mstLable: 'Reorder',
        tbName: 'item_reorder',
        colName: 'name',
        fields: ['name', 'description'],
    },
    mainLocation: {
        mstLable: 'Main location',
        tbName: 'item_main_loc',
        colName: 'name',
        fields: ['name', 'description'],
    },
    hsnCode: {
        mstLable: 'HSN code',
        tbName: 'item_hsn_code',
        colName: 'name',
        fields: ['name', 'description'],
    },
    category: {
        mstLable: 'Category',
        tbName: 'item_category',
        colName: 'name',
        fields: ['name', 'description'],
    },
    fim: {
        mstLable: 'FIM',
        tbName: 'item_fim_id',
        colName: 'name',
        fields: ['name', 'description', 'packingCharge'],
        defaults: { packingCharge: 0 },
    },
    rmItemcode: {
        mstLable: 'RM code',
        tbName: 'item_rm_code',
        colName: 'name',
        fields: ['name', 'description'],
    },
    subLocation: {
        mstLable: 'Sub Location',
        tbName: 'item_sub_loc',
        colName: 'name',
        fields: ['name', 'description'],
    },
    productFinish: {
        mstLable: 'Product Finish',
        tbName: 'item_product_finish',
        colName: 'name',
        fields: ['name', 'description'],
    },
    productFamily: {
        mstLable: 'Product Family',
        tbName: 'item_product_family',
        colName: 'name',
        fields: ['name', 'description'],
    },
    product: {
        mstLable: 'Product',
        tbName: 'mst_products',
        colName: 'name',
        fields: ['name', 'description'],
    },
};

const generalMasterKeys = new Set([
    'currency', 'customerGroup', 'pm', 'machine', 'role', 'department', 'sp', 'dtr', 'section',
    'city', 'state', 'country', 'supplierGroup', 'tool', 'uom', 'supplyType', 'gstinOrUin',
    'placeOfSupply', 'designation', 'itemGroup', 'tarrif', 'trf', 'orderType', 'menu', 'location',
    'displayName', 'inspectionLevel', 'problemCategory', 'natureOfProblem', 'cellMaster'
]);

const buildInsertSQL = (table, fields) =>
    `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;

const buildUpdateSQL = (table, fields) =>
    `UPDATE ${table} SET ${fields.map(f => `${f}=?`).join(', ')} WHERE id=?`;

const buildDeleteSQL = (table) =>
    `UPDATE ${table} SET dflag=1 WHERE id = ?`;

function query(master, queryTye) {
    const config = collection[master];
    if (!config) return null;

    const { tbName: table, fields } = config;

    switch (queryTye) {
        case 'insert': return buildInsertSQL(table, fields);
        case 'update': return buildUpdateSQL(table, fields);
        case 'delete': return buildDeleteSQL(table);
        default: return null;
    }
}

function value(master, data) {
    const config = collection[master];
    if (!config) return null;

    const { fields, defaults = {} } = config;
    return fields.map(f => (f in defaults) ? (data[f] ?? defaults[f]) : data[f]);
}

module.exports = { collection, query, value, generalMasterKeys };