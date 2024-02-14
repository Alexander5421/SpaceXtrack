function timeToString(shortestTime) {
    const days = Math.floor(shortestTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((shortestTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((shortestTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((shortestTime % (1000 * 60)) / 1000);
    let result = "";
    if (days > 0) {
        result += days + " days ";
    }
    if (hours > 0) {
        result += hours + " hours ";
    }
    if (minutes > 0) {
        result += minutes + " minutes ";
    }
    if (seconds > 0) {
        result += seconds + " seconds ";
    }
    return result;
}

function calculateShortestTime(newLaunchCount) {
    const sheet = SpreadsheetApp.openById("1mXaJ40SvLBtVkxXvl7pbHRWhjPC8ZOleaqJ9fR8xH7g").getSheetByName("SpaceX");
    const recordSheet = SpreadsheetApp.openById("1mXaJ40SvLBtVkxXvl7pbHRWhjPC8ZOleaqJ9fR8xH7g").getSheetByName("Record");
    const recordSheetData = recordSheet.getRange("A1").getValue();
    var AllRecord = recordSheetData ? JSON.parse(recordSheetData) : {};

    let range, values;
    if (newLaunchCount) {
        range = sheet.getRange(sheet.getLastRow() - newLaunchCount, 1, newLaunchCount + 1, 3);
    } else {
        range = sheet.getDataRange();
    }
    values = range.getValues();
    let originalRecord = AllRecord["ShortestTime"];
    var shortestTime, launch1, launch2;

    if (originalRecord) {
        shortestTime = originalRecord["rawTimeData"];
        launch1 = originalRecord["Launch1"];
        launch2 = originalRecord["Launch2"];
    } else {
        shortestTime = Number.MAX_SAFE_INTEGER;
        launch1 = "";
        launch2 = "";
    }

    var newRecord = false;
    for (let i = 1; i < values.length; i++) {
        const date1 = new Date(values[i][2]);
        const date2 = new Date(values[i - 1][2]);
        const timeDifference = Math.abs(date1 - date2);
        if (timeDifference < shortestTime) {
            shortestTime = timeDifference;
            launch1 = values[i - 1][0];
            launch2 = values[i][0];
            newRecord = true;
        }
    }

    if (!newRecord) {
        return;
    }

    var shortestTimeRecord = {};
    result = timeToString(shortestTime);
    shortestTimeRecord["rawTimeData"] = shortestTime;
    shortestTimeRecord["ToString"] = result;
    shortestTimeRecord["Launch1"] = launch1;
    shortestTimeRecord["Launch2"] = launch2;

    AllRecord["ShortestTime"] = shortestTimeRecord;
    recordSheet.getRange("A1").setValue(JSON.stringify(AllRecord, null, '\t'));

    return shortestTimeRecord;
}