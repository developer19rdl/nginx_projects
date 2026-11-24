
import { Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

const MonthlyPreventiveTable = ({ monthPreventiveTrendData }) => {

  return (
    <div style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
      <Table>

        <TableHead>
          <TableRow>
            <TableCell><b></b></TableCell>

            {monthPreventiveTrendData.map((m, i) => (
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

            {monthPreventiveTrendData.map((m, i) => (
              <TableCell align="center" key={i}>
                {m.Target}
              </TableCell>
            ))}
          </TableRow>

          {/* ACTUAL ROW */}
          <TableRow>
            <TableCell><b>Actual</b></TableCell>

            {monthPreventiveTrendData.map((m, i) => (
              <TableCell align="center" key={i}>
                {m.Actual}
              </TableCell>
            ))}
          </TableRow>

        </TableBody>
      </Table>
    </div>
  );
};

export default MonthlyPreventiveTable;

