import { Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

const MonthlyBreakdownTable = ({ monthBreakdownTrendData }) => {

  return (
    <div style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
      <Table>

        <TableHead>
          <TableRow>
            <TableCell><b></b></TableCell>

            {monthBreakdownTrendData.map((m, i) => (
              <TableCell key={i} align="center">
                <b>{m.month}</b>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>

          {/* TARGET ROW */}
          <TableRow>
            <TableCell><b>Target</b></TableCell>

            {monthBreakdownTrendData.map((m, i) => (
              <TableCell align="center" key={i}>
                {m.target}
              </TableCell>
            ))}
          </TableRow>

          {/* ACTUAL ROW */}
          <TableRow>
            <TableCell><b>Actual</b></TableCell>

            {monthBreakdownTrendData.map((m, i) => (
              <TableCell align="center" key={i}>
                {m.actual}
              </TableCell>
            ))}
          </TableRow>

        </TableBody>
      </Table>
    </div>
  );
};

export default MonthlyBreakdownTable;
