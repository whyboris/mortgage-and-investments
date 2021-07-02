const { Table } = require('console-table-printer');
var asciichart = require('asciichart');

// =================================================================================================
// To use, just edit the values below
//
// You can add new 'scenarios' to compare various strategies - just duplicate and follow the pattern
//                                     and make sure to add it to the list: `const scenarios = [...]`
// -------------------------------------------------------------------------------------------------

const scenario1 = {
  // mortgage:
  mortgage: 125000,             // starting mortgage amount
  mortgageRate: 0.042,          // current interest rate (4.20% = 0.042)
  mortgagePayment: 1420.69,     // monthly mortgage payment

  // investments:
  investment: 9001,             // starting investment amount
  stockRate: 0.07,              // estimated annual returns on your stock investments (7% = 0.07)
  additionalInvestment: 420.69, // monthly additional money invested
}

const scenario2 = {
  // mortgage:
  mortgage: 125000,             // starting mortgage amount
  mortgageRate: 0.042,          // current interest rate (4.20% = 0.042)
  mortgagePayment: 1520.69,     // monthly mortgage payment

  // investments:
  investment: 9001,             // starting investment amount
  stockRate: 0.07,              // estimated annual returns on your stock investments (7% = 0.07)
  additionalInvestment: 320.69, // monthly additional money invested
}

const scenarios = [scenario1, scenario2];  // <-- add `scenario3` if you create a new scenario, etc.

// duration:
const numberOfYears = 10;      // the number of years you'd like the simulation to run

// extra:
const printTable = true;       // you can set this to `false`
const tableDetail = 'quarterly'; // can be `quarterly`, `monthly`, or `yearly`
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
// Chart colors:
// change order if you'd like the graph to have different colors
// order corresponds to scenarios. Keep color and lightcolor together (as a pair)
const allowedColors = [
  asciichart.green,
  asciichart.lightgreen,
  asciichart.red,
  asciichart.lightred,
  asciichart.blue,
  asciichart.lightblue,
  asciichart.yellow,
  asciichart.lightyellow,
  asciichart.magenta,
  asciichart.lightmagenta,
  asciichart.cyan,
  asciichart.lightcyan,
  asciichart.darkgray,
  asciichart.lightgray,
  asciichart.white,
  asciichart.black,
];

// =================================================================================================

// keep track of each scenario's history
scenarios.forEach((scenario) => {
  scenario.mortgageChart = [];
  scenario.investmentChart = [];
  scenario.totalToInterest = 0; // keep track of how much was paid in mortgage interest
  scenario.totalToMortgage = 0; // keep track of how much was paid to mortgage total
});

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const amortizationColumns = [];
const comparisons = [];
const chartColors = [];

for (let i = 0; i < scenarios.length; i++) {
  amortizationColumns.push({
    name: 'mortgage' + (i + 1), title: allowedColors[i * 2] + '#' + (i + 1) + ' mortgage' + asciichart.reset
  });
  amortizationColumns.push({
    name: 'investment' + (i + 1), title: allowedColors[i * 2] + '#' + (i + 1) + ' stocks' + asciichart.reset
  });
  comparisons.push({
    name: 'value' + i,
    title: allowedColors[i * 2] + 'Scenario ' + (1 + i) + asciichart.reset,
  });
  // makes `color` and `lightcolor` correspond to mortgage and investment
  chartColors.push(allowedColors[i * 2]);
  chartColors.push(allowedColors[i * 2 + 1]);
}

const mortgageAndStockTable = new Table({
  columns: [
    { name: 'month', title: 'Time' },
    ...amortizationColumns
  ],
  title: 'Mortgage and investments',
});

const startAmountTable = new Table({
  columns: [
    { name: 'label', alignment: 'left', title: ' ' },
    ...comparisons
  ],
  title: 'Initial conditions',
});

const endAmountTable = new Table({
  columns: [
    { name: 'label', alignment: 'left', title: ' ' },
    ...comparisons
  ],
  title: 'Final conditions',
});

const chartConfig = {
  colors: chartColors,
  height: chartHeight,
  format: formatAxis
}

// =================================================================================================

// When property is `mortgage` return:
// [ label: 'XXX', value0: dollars(scenarios[0].mortgage), value1: dollars(scenarios[1].mortgage), ... ]
function createRow(label, property) {
  const row = {};
  row['label'] = label;

  for (let i = 0; i < scenarios.length; i++) {
    if (property !== ' ') {
      row['value' + i] = dollars(scenarios[i][property]);
    }
  }

  return row;
}

function createRowInterest() {
  const row = { label: 'Mortgage interest' };

  for (let i = 0; i < scenarios.length; i++) {
    row['value' + i] = scenarios[i].mortgageRate * 100 + '%';
  }

  return row;
}

function createRowStockRate() {
  const row = { label: 'Stock return' };

  for (let i = 0; i < scenarios.length; i++) {
    row['value' + i] = Math.round(scenarios[i].stockRate * 10000) / 100 + '%';
  }

  return row;
}

startAmountTable.addRows([
  createRow('Mortgage amount', 'mortgage'),
  createRow('Mortgage payment', 'mortgagePayment')
]);
startAmountTable.addRow(
  createRowInterest(), { color: 'green' }
);
startAmountTable.addRows([
  createRow(' ', ' '),
  createRow('Investment start', 'investment'),
  createRow('Monthly investment', 'additionalInvestment')
]);
startAmountTable.addRow(
  createRowStockRate(), { color: 'green' }
);

runForYears(numberOfYears);

if (printTable) {
  mortgageAndStockTable.printTable();
  console.log();
}

startAmountTable.printTable();

const allChartData = [];

console.log();
console.log('LEGEND');
for (let i = 0; i < scenarios.length; i++) {
  console.log(allowedColors[i * 2] + 'Scenario ' + (i + 1) + asciichart.reset);
  allChartData.push(scenarios[i].mortgageChart);
  allChartData.push(scenarios[i].investmentChart);
}
console.log();

console.log(asciichart.plot(allChartData, chartConfig));

endAmountTable.addRows([
  createRow('Total paid to mortgage', 'totalToMortgage'),
  createRow('Total to mortgage interest', 'totalToInterest'),
  createRow('Still owe mortgage', 'mortgage'),
  createRow(' ', ' '),
  createRow('Money in stocks', 'investment'),
]);

endAmountTable.printTable();

// =================================================================================================

function runForYears(years) {
  for (let year = 0; year < years; year++) {

    logMonths('Year ' + year);

    for (let month = 1; month <= 12; month++) {
      scenarios.forEach((scenario) => {
        computeMonth(scenario);
      });

      if (tableDetail === 'quarterly') {
        if ([3, 6, 9].includes(month)) { // log every quarter, i.e. 3rd, 6th, 9th months
          logMonths('Q' + month / 3);
        }
      } else if (tableDetail === 'monthly') {
        if (month !== 12) {
          logMonths(' ' + month);
        }
      }

      scenarios.forEach((scenario) => {
        scenario.mortgageChart.push(scenario.mortgage);
        scenario.investmentChart.push(scenario.investment);
      });

    }
  }

  logMonths('Year ' + years); // the last day of the last year of simulation;

}

// Update mortgage and investments
// x = scenario (object)
function computeMonth(x) {
  x.investment = x.investment * (1 + x.stockRate / 12) + x.additionalInvestment;
  x.mortgageInterest = x.mortgage * x.mortgageRate / 12;
  x.totalToInterest = x.totalToInterest + x.mortgageInterest;
  x.mortgage = x.mortgage - (x.mortgagePayment - x.mortgageInterest);

  if (x.mortgage <= 0) {
    x.mortgage = 0;
    x.investment = x.investment + x.mortgagePayment;
  } else {
    x.totalToMortgage = x.totalToMortgage + x.mortgagePayment;
  }
}

// format a number as $##,###.##
function dollars(amount) {
  return formatter.format(amount);
}

// add month data to the `mortgageAndStockTable`
function logMonths(month = 'year') {
  // colorize the first month of the year:
  const color = month.startsWith('Y') ? { color: 'green' } : undefined;

  const newRow = {};

  newRow['month'] = month;
  for (let i = 0; i < scenarios.length; i++) {
    newRow['mortgage' + (i + 1)] = dollars(scenarios[i].mortgage);
    newRow['investment' + (i + 1)] = dollars(scenarios[i].investment);
  }

  mortgageAndStockTable.addRow(newRow, color);
}

// y-axis formatting for the chart
function formatAxis(x) {
  return dollars(Math.round(x / 1000) * 1000).padStart(11, ' ');
}
