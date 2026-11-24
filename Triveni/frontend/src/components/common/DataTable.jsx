import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

/**
 * Generic, reusable server-driven data table.
 * columns: [{ key, label, render?(row), sortable? }]
 * meta: { page, pageSize, total } (1-based page, matches backend pagination contract)
 */
export default function DataTable({
  columns,
  rows,
  meta,
  loading,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortDir,
  onSortChange,
  onRowClick,
  emptyMessage = 'No records found',
  tableSx,
}) {
  return (
    <Paper variant="outlined">
      <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Table
          size="small"
          sx={[
            {
              '& .MuiTableCell-root': { border: '1px solid', borderColor: 'divider' },
              '& .MuiTableHead-root .MuiTableCell-root': { fontWeight: 700, bgcolor: 'action.hover' },
            },
            ...(Array.isArray(tableSx) ? tableSx : [tableSx]),
          ]}
        >
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortBy === col.key}
                      direction={sortBy === col.key ? sortDir?.toLowerCase() : 'asc'}
                      onClick={() => onSortChange?.(col.key)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : rows?.length ? (
              rows.map((row, idx) => (
                <TableRow
                  key={row.id ?? idx}
                  hover={!!onRowClick}
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key}>{col.render ? col.render(row) : row[col.key]}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {meta && (
        // TablePagination's internal toolbar doesn't wrap on its own - on a phone-width screen
        // (~360-400px) "Rows per page" + the select + "1-25 of 250" + the prev/next arrows don't
        // fit in one row. Scrolling it horizontally (rather than trying to force it to wrap, which
        // MUI's own toolbar layout resists) keeps the rest of the page from being forced wide too.
        <Box sx={{ overflowX: 'auto' }}>
          <TablePagination
            component="div"
            count={meta.total || 0}
            page={(meta.page || 1) - 1}
            onPageChange={(e, newPage) => onPageChange?.(newPage + 1)}
            rowsPerPage={meta.pageSize || 25}
            onRowsPerPageChange={(e) => onPageSizeChange?.(parseInt(e.target.value, 10))}
            rowsPerPageOptions={[10, 25, 50, 100]}
            sx={{ '& .MuiTablePagination-toolbar': { flexWrap: 'nowrap', minWidth: 'fit-content' } }}
          />
        </Box>
      )}
    </Paper>
  );
}
