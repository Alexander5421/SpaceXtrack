// Function to fetch data from Google Sheets and display it as a chart
let chart;
let currYear = new Date().getFullYear();
let CurrMonth = new Date().getMonth() + 1;
let displayYear;
let thisYearBackGroundColor = 'rgba(255, 99, 132, 0.6)';
let lastYearBackGroundColor = 'rgba(0, 123, 255, 0.6)';
let thisYearBorderColor = 'rgba(255, 99, 132, 1)';
let lastYearBorderColor = 'rgba(0, 123, 255, 1)';
let thisYearGreyColor = 'rgba(255, 99, 132, 0.15)';
import apiKey from './config.js';

async function fetchDataAndDisplayChart() {
    const sheetId = '1mXaJ40SvLBtVkxXvl7pbHRWhjPC8ZOleaqJ9fR8xH7g';
    const range = 'Test!A:C';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        var rows = data.values; // Assuming the first row is headers, and the rest are data
        rows = rows.slice(1); // Remove the header row

        // Extract unique years from the data
        const years = [...new Set(rows.map(row => row[0].split('-')[0]))];
        years.shift(); // Delete the first element

        const dropdown = document.getElementById('yearDropdown');

        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.text = year;
            dropdown.add(option);
        });
        // auto select the last year-1
        dropdown.selectedIndex = dropdown.length - 2;

        // Add event listener to the dropdown
        dropdown.addEventListener('change', function () {
            // Filter the data for the selected year
            const selectedYear = this.value;
            const filteredRows = rows.filter(row => row[0].split('-')[0] == selectedYear);
            const lastYearRows = rows.filter(row => row[0].split('-')[0] == (selectedYear - 1));
            displayYear = selectedYear;
            // Update the chart
            updateChart(filteredRows, lastYearRows);
        });

        // Initial chart display for the selected year
        const initialRows = rows.filter(row => row[0].split('-')[0] == dropdown.value);
        const initialLastYearRows = rows.filter(row => row[0].split('-')[0] == (dropdown.value - 1));
        updateChart(initialRows, initialLastYearRows);
    } catch (error) {
        console.error('Error fetching data: ', error);
    }
}



// Function to update the chart
function updateChart(thisYearRows, lastYearRows) {

    var labels = thisYearRows.map(function (e) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = parseInt(e[0].split('-')[1]) - 1;
        return monthNames[monthIndex];
    });
    var thisYearlaunchCounts = thisYearRows.map(function (e) {
        return e[1]; // Launch Count
    });
    var lastYearlaunchCounts = lastYearRows.map(function (e) {
        return e[1]; // Launch Count
    });
    // log this year and last year sum of launch counts
    console.log(thisYearlaunchCounts.reduce((a, b) => parseInt(a) + parseInt(b), 0));
    console.log(lastYearlaunchCounts.reduce((a, b) => parseInt(a) + parseInt(b), 0));
    


    var maxLaunchCount = Math.max(...thisYearlaunchCounts, ...lastYearlaunchCounts);
    var yAxisMax = Math.ceil(maxLaunchCount * 1.2);

    const dottedBorderPlugin = {
        id: 'dottedBorderPlugin',
        afterDraw: (chart) => {
            const ctx = chart.ctx;
            const xAxis = chart.scales.x; // Adjust based on your axis ID
            const yAxis = chart.scales.y; // Adjust based on your axis ID
            // Specify the label or index of the x-value you want to highlight
            const datasetIndex = 1; // Index of the dataset containing the bar to highlight

            // Find the bar corresponding to the specific label
            const barMeta = chart.getDatasetMeta(datasetIndex).data[chart.getDatasetMeta(datasetIndex).data.length - 1];
            if (!barMeta) return; // Bar not found

            // Dotted border settings
            // grey color
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]); // Dotted line pattern: [lineLength, spaceLength]

            // Draw rectangle around the bar
            ctx.strokeRect(barMeta.x - barMeta.width / 2, barMeta.y, barMeta.width, yAxis.bottom - barMeta.y);

            // Reset line dash to ensure other drawings are not affected
            ctx.setLineDash([]);
        }
    };


    if (!chart) {
        chart = new Chart(document.getElementById('myChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'last year Launch Count',
                        data: lastYearlaunchCounts,
                        backgroundColor: lastYearBackGroundColor,
                        borderColor: lastYearBorderColor,
                        borderWidth: 1
                    },
                    {
                        label: 'this year Launch Count',
                        data: thisYearlaunchCounts,
                        backgroundColor: thisYearBackGroundColor,
                        borderColor: thisYearBorderColor,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: yAxisMax,
                        ticks: {
                            // forces step size to be 50 units
                            stepSize: 1
                        }
                    },
                    x: {
                        type: 'category',
                        offset: true,
                        grid: {
                            display: false
                        },
                        afterBuildTicks: function (scale) {
                            const datasetLength = scale.chart.data.datasets[0].data.length;
                            scale.ticks.forEach((tick, index) => {
                                tick.color = index < datasetLength ? '#000' : '#ccc'; // grey color for the future months
                            });
                        },
                        ticks: {
                            // Use a function to set the color dynamically
                            color: function (context) {
                                // Return the color assigned during the afterBuildTicks phase
                                return context.tick.color;
                            }
                        }
                    }
                },
                maintainAspectRatio: false
            },
            plugins: [dottedBorderPlugin, ChartDataLabels]
        });
        chart.options.plugins.dottedBorderPlugin = false;
        chart.update();
    } else {
        var dataset = chart.data.datasets[1];
        chart.data.datasets[0].data = lastYearlaunchCounts;
        chart.data.datasets[1].data = thisYearlaunchCounts;
        chart.options.scales.y.max = yAxisMax;
        if (currYear == displayYear) {
            dataset.backgroundColor = new Array(dataset.data.length).fill(thisYearBackGroundColor);
            dataset.backgroundColor[CurrMonth - 1] = thisYearGreyColor; // Highlight the current month
            chart.options.plugins.dottedBorderPlugin = true;

        } else {
            dataset.backgroundColor = new Array(dataset.data.length).fill(thisYearBackGroundColor);
            chart.options.plugins.dottedBorderPlugin = false;
        }

        chart.update();
    }

}


fetchDataAndDisplayChart();