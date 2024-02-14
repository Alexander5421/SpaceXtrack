

function collectHistoricalLaunches() {
    const sheet = SpreadsheetApp.openById("1mXaJ40SvLBtVkxXvl7pbHRWhjPC8ZOleaqJ9fR8xH7g").getSheetByName("SpaceX");
    // 初始化API请求参数
    let apiUrl = "https://ll.thespacedevs.com/2.2.0/launch/previous/?search=SpaceX&mode=list&limit=100";
    let totalLaunchesNeeded = 300;
    let collectedLaunches = [];

    while (collectedLaunches.length < totalLaunchesNeeded && apiUrl != null) {
        const response = UrlFetchApp.fetch(apiUrl);
        const data = JSON.parse(response.getContentText());
        // 添加当前请求的发射数据
        collectedLaunches = collectedLaunches.concat(data.results.map(launch => [launch.id, launch.name, launch.net]));
        // 准备下一次请求的URL
        apiUrl = data.next;
        Utilities.sleep(500);
    }

    // 由于API返回的是最新的在前，我们需要反转数组以按时间顺序（由旧到新）添加
    collectedLaunches.reverse();

    const numberOfColumns = 3; // ID, 名称, NET
    // 填充新的数据
    if (collectedLaunches.length > 0) {
        sheet.getRange(1, 1, collectedLaunches.length, numberOfColumns).setValues(collectedLaunches);
    }
}


function updateSheetWithRecentLaunchesAndNotify() {
    const sheet = SpreadsheetApp.openById("1mXaJ40SvLBtVkxXvl7pbHRWhjPC8ZOleaqJ9fR8xH7g").getSheetByName("SpaceX");
    let offset = 0;
    let limit = 2; // 初始查询窗口大小
    const maxLimit = 64; // 最大查询窗口大小
    let lastRow = sheet.getLastRow();
    let lastLaunchId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() : null;
    let newLaunchesAdded = false; // 标记是否有新的发射被添加
    let foundExistingLaunch = false;
    let newLaunchesInfo = [];

    while (!foundExistingLaunch) {
        const apiUrl = `https://ll.thespacedevs.com/2.2.0/launch/previous/?search=SpaceX&mode=list&limit=${limit}&offset=${offset}`;
        const response = UrlFetchApp.fetch(apiUrl);
        const data = JSON.parse(response.getContentText());
        const launches = data.results;

        if (launches.length === 0) break;

        for (let i = 0; i < launches.length; i++) {
            const launch = launches[i];
            if (lastLaunchId === launch.id) {
                foundExistingLaunch = true;
                break; // 找到Sheet中的最后一次发射，结束查询
            } else {
                // 添加新的发射到Sheet，并记录日志
                const newRow = [launch.id, launch.name, launch.net];
                sheet.insertRowAfter(lastRow);
                const newRowRange = sheet.getRange(lastRow + 1, 1, 1, 3);
                newRowRange.setValues([newRow]);
                newLaunchesInfo.push({ name: launch.name, net: launch.net });
                console.log(`New launch added: ID = ${launch.id}, Name = ${launch.name}, NET = ${launch.net}`);
                newLaunchesAdded = true; // 标记有新的发射被添加
            }
        }

        offset += limit;
        limit = Math.min(limit * 2, maxLimit); // 更新查询窗口，不超过最大值
    }

    // 如果有新的发射被添加，发送邮件通知
    if (newLaunchesAdded) {
        const subject = "New SpaceX Launches Added";
        let message = "New SpaceX launches have been added to the sheet.\n";
        newLaunchesInfo.forEach(launch => {
            message += `Name: ${launch.name}\nNET: ${launch.net}\n\n`;
        });
        MailApp.sendEmail(Session.getActiveUser().getEmail(), subject, message);
        console.log("Email notification sent.");
    }
    if (newLaunchesAdded) {
        MonthLaunchCountUpdate(newLaunchesInfo.length);
    }

    if (newLaunchesAdded) {
        newRecord = calculateShortestTime(newLaunchesInfo.length);
        if (newRecord) {
            const subject = 'New record for shortest time between launches';
            const body = `New record: ${newRecord["ToString"]}\nLaunch 1: ${newRecord["Launch1"]}\nLaunch 2: ${newRecord["Launch2"]}`;
            MailApp.sendEmail(Session.getActiveUser().getEmail(), subject, body);
            console.log("New Record");
        }
    }
}


