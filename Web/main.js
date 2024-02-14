// Function to fetch data from Google Sheets and display it as a chart
let chart;
let currYear = new Date().getFullYear();
let CurrMonth = new Date().getMonth() + 1;
let displayYear;
async function fetchDataAndDisplayChart() {
    const sheetId = '1mXaJ40SvLBtVkxXvl7pbHRWhjPC8ZOleaqJ9fR8xH7g';
    const apiKey = 'AIzaSyCBI1uJ1lgwOKXJxoU3cuiWTQiAsyfbT0o';
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
        dropdown.addEventListener('change', function() {
            // Filter the data for the selected year
            const selectedYear = this.value;
            const filteredRows = rows.filter(row => row[0].split('-')[0] === selectedYear);
            displayYear = selectedYear;
            // Update the chart
            updateChart(filteredRows);
        });

        // Initial chart display for the selected year
        const initialRows = rows.filter(row => row[0].split('-')[0] === dropdown.value);
        updateChart(initialRows);
    } catch (error) {
        console.error('Error fetching data: ', error);
    }
}

// Function to update the chart
function updateChart(rows) {
    var labels = rows.map(function (e) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = parseInt(e[0].split('-')[1]) - 1;
        return monthNames[monthIndex];
    });
    var launchCounts = rows.map(function (e) {
        return e[1]; // Launch Count
    });
    

    var maxLaunchCount = Math.max(...launchCounts);
    var yAxisMax = Math.ceil(maxLaunchCount * 1.2);
    if(!chart){
        chart = new Chart(document.getElementById('myChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Launch Count',
                    data: launchCounts,
                    backgroundColor: 'rgba(0, 123, 255, 0.6)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 1
                }]
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
                        }
                    }
                },
                maintainAspectRatio: false
            }
        });
    }else{
        if (currYear == displayYear ) {
            console.log('currYear', currYear);
            chart.data.datasets[0].backgroundColor =  'rgba(0, 123, 255, 0.1)';
        }
        chart.data.datasets[0].data = launchCounts;
        chart.options.scales.y.max = yAxisMax;
        chart.update();
    }
    
}

fetchDataAndDisplayChart();