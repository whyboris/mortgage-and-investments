// =============================================================================
// To use, just edit the values below
// -----------------------------------------------------------------------------

// mortgage:
let mortgage = 125000;         // starting mortgage amount
const mortgageRate = 0.042;    // current interest rate (4.20% = 0.042)
let mortgagePayment = 1420.69; // monthly mortgage payment

// investments:
let investment = 9001;            // starting investment amount
const stockRate = 0.07;            // estimated annual returns on your stock investments (7% = 0.07)
let additionalInvestment = 420.69; // monthly additional money invested

// duration:
const numberOfYears = 10;      // the number of years you'd like the simulation to run

// extra:
const printTable = true;       // you can set this to `false`
const chartHeight = 25;        // how tall the chart should be

// note: after mortgage is paid off, the mortgage payment amount is automatically
//       added to investments (is invested) every month
//
// note: during the month when mortgage is fully paid off, 
//       some money is not accounted for simplicity of calculation
//
// note: calculations use interest compounded monthly, not continuously
//       this is close to, but not exactly what banks will use
//
// =============================================================================

const { Table } = require('console-table-printer');
var asciichart = require ('asciichart');

let totalToInterest = 0; // keep track of how much was paid in mortgage interest
let totalToMortgage = 0; // keep track of how much was paid to mortgage total
let initialInvestment = investment; // keep track of original starting point

const mortgageChart = [];
const investmentChart = [];

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const mortgageAndStockTable = new Table({
  columns: [
    { name: 'month', title: 'Time'},
    { name: 'mortgage', title: 'Mortage owed'},
    { name: 'investment', title: 'In stocks'}
  ],
  title: 'Mortgage and investments',
});

const startAmountTable = new Table({
  columns: [
    { name: 'label', alignment: 'left', title: ' '},
    { name: 'value', title: 'Value'}
  ],
  title: 'Initial conditions',
});

const endAmountTable = new Table({
  columns: [
    { name: 'label', alignment: 'left', title: ' '},
    { name: 'value', title: 'Value'}
  ],
  title: 'Final conditions',
});

const chartConfig = {
  colors: [
    asciichart.blue,
    asciichart.green,
  ],
  height: chartHeight,
  format: formatAxis
}

// =============================================================================

startAmountTable.addRows([
  { label: 'Mortgage amount', value: dollars(mortgage) },
  { label: 'Mortgage payment', value: dollars(mortgagePayment) },
]);
startAmountTable.addRow(
  { label: 'Mortgage interest', value: mortgageRate * 100 + '%' }, { color: 'green' }
);
startAmountTable.addRows([
  { label: ' ', value: ' ' },
  { label: 'Investment start', value: dollars(investment) },
  { label: 'Monthly investment', value: dollars(additionalInvestment) },
]);
startAmountTable.addRow(
  { label: 'Stock return', value: Math.round(stockRate * 10000) / 100 + '%' }, { color: 'green' }
);

runForYears(numberOfYears);

if (printTable) {
  mortgageAndStockTable.printTable();
  console.log();
}

startAmountTable.printTable();

console.log(asciichart.plot([mortgageChart, investmentChart], chartConfig ));

endAmountTable.addRows([
  { label: "Total paid to mortgage", value: dollars(totalToMortgage) },
  { label: "Total to mortgage interest", value: dollars(totalToInterest) },
  { label: ' ', value: ' ' },
  { label: "Total investments", value: dollars(investment) },
]);
endAmountTable.addRow(
  { label: "Made from stocks", value: dollars(investment - initialInvestment) }, { color: 'green' }
);

endAmountTable.printTable();

// ==========================================================================

function runForYears(years) {
  for (let year = 0; year < years; year++) {
    logMonth('Year ' + year);
    for (let month = 1; month <= 12; month++) {
      computeMonth(month);
    }
  }
  logMonth('Year ' + years); // the last day of the last year of simulation;
}

// Update mortgage and investments
function computeMonth(month) {
  investment = investment * (1 + stockRate / 12) + additionalInvestment;
  mortgageInterest = mortgage * mortgageRate / 12;
  totalToInterest = totalToInterest + mortgageInterest;
  mortgage = mortgage - (mortgagePayment - mortgageInterest);

  if (mortgage <= 0) {
    mortgage = 0;
    investment = investment + mortgagePayment;
  } else {
    totalToMortgage = totalToMortgage + mortgagePayment;
  }

  if ([3, 6, 9].includes(month)) { // log every quarter, i.e. 3rd, 6th, 9th months
    logMonth('Q' + month / 3);
  }

  mortgageChart.push(mortgage);
  investmentChart.push(investment);
}

// format a number as $##,###.##
function dollars(amount) {
  return formatter.format(amount);
}

// add month data to the `mortgageAndStockTable`
function logMonth(month = 'year') {
  // colorize the first month of the year:
  const color = month.startsWith('Y') ? { color: 'green' } : undefined;

  mortgageAndStockTable.addRow({
    month: month,
    mortgage: dollars(mortgage),
    investment: dollars(investment)
  }, color);
}

// y-axis formatting for the chart
function formatAxis(x) {
  return dollars(Math.round(x / 1000) * 1000).padStart(11, ' ');
}
