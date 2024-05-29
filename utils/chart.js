const Order = require('../models/orderModel');



async function getOrderCountsBy3HourWindows(date) {
    const offset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds (5 hours 30 minutes)

    // Start time: 6:30 PM IST of the previous day
    let startOfDayUTC = new Date(date);
    startOfDayUTC.setDate(startOfDayUTC.getDate() - 1)
    console.log(startOfDayUTC)
    startOfDayUTC.setUTCHours(18, 30, 0, 0); // Set time to 6:30 PM IST

    // End time: 6:29 PM IST of the current day
    let endOfDayUTC = new Date(date);
    endOfDayUTC.setUTCHours(18, 29, 59, 999); // Set time to 6:29 PM IST

    // console.log("startOfDayUTC", startOfDayUTC);
    // console.log("endOfDayUTC", endOfDayUTC);

    const orderCounts = await Order.aggregate([
        {
            $match: {

                createdAt: { $gte: startOfDayUTC, $lte: endOfDayUTC }
            }
        },
        {
            $addFields: {
                // Adjusting createdAt to IST
                createdAtIST: {
                    $add: ['$createdAt', offset] // Adjust to IST
                }
            }
        },
        {
            $project: {
                hourOfDay: { $hour: '$createdAtIST' }
            }
        },
        {
            $group: {
                _id: {
                    $subtract: [
                        { $divide: ['$hourOfDay', 3] },
                        { $mod: [{ $divide: ['$hourOfDay', 3] }, 1] }
                    ]
                },
                units: { $sum: 1 }
            }
        },
        {
            $sort: { '_id': 1 }
        }
    ]);
    console.log("orderCounts", orderCounts);
    // Generate all 3-hour windows for the day
    const allWindows = [];
    for (let i = 0; i < 24; i += 3) {
        allWindows.push({
            date: `${i}:00 - ${i + 3}:00`,
            units: 0
        });
    }
    // Merge the results with all windows
    const result = allWindows.map(date => {
        const found = orderCounts.find(entry => entry._id * 3 === parseInt(date.date.split(':')[0]));
        return found ? { date: date.date, units: found.units } : date;
    });
    console.log("RESULT", result);
    return result;
}

async function getOrderCountsBy7DayWindows(date) {
    const offset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds (5 hours 30 minutes)

    const today = new Date(date)
    console.log("today", today);
    let startOfMonth = new Date(today)
    startOfMonth.setUTCDate(1)
    let endOfMonth = new Date(today);
    endOfMonth.setUTCMonth(endOfMonth.getUTCMonth() + 1);
    endOfMonth.setUTCDate(0);

    console.log("startOfMonth", startOfMonth);
    console.log("endOfMonth", endOfMonth);

    const orderCounts = await Order.aggregate([
        {
            $match: {

                createdAt: { $gte: startOfMonth, $lte: endOfMonth }
            }
        },
        // {
        //     $addFields: {
        //         // Adjusting createdAt to IST
        //         createdAtIST: {
        //             $add: ['$createdAt', offset] // Adjust to IST
        //         }
        //     }
        // },
        {
            $project: {
                dayOfMonth: { $dayOfMonth: '$createdAt' }
            }
        },
        {
            $group: {
                _id: {
                    $subtract: [
                        { $divide: ['$dayOfMonth', 7] },
                        { $mod: [{ $divide: ['$dayOfMonth', 7] }, 1] }
                    ]
                },
                units: { $sum: 1 }
            }
        },
        {
            $sort: { '_id': 1 }
        }
    ]);
    console.log("orderCounts", orderCounts);

    const daysInMonth = new Date(startOfMonth.getUTCFullYear(), startOfMonth.getUTCMonth() + 1, 0).getUTCDate();
    console.log("daysin month", daysInMonth);
    // for (let i = 0; i < daysInMonth; i += 7) {
    //     allWindows.push({
    //         date: `${i + 1}-${Math.min(i + 7, daysInMonth)}`,
    //         units: 0
    //     });
    // }




    const allWindows = [];
    for (let i = 0; i < daysInMonth; i += 7) {
        allWindows.push({
            date: `${i + 1}-${Math.min(i + 7, daysInMonth)}`,
            units: 0
        });
    }

    // Merge the results with all windows
    const result = allWindows.map(window => {
        const found = orderCounts.find(entry => entry._id * 7 === parseInt(window.date.split('-')[0]) - 1);
        return found ? { date: window.date, units: found.units } : window;
    });


    // // Merge the results with all windows
    // const result = allWindows.map(date => {
    //     const found = orderCounts.find(entry => entry._id * 7 === parseInt(date.date.split(':')[0]));
    //     return found ? { date: date.date, units: found.units } : date;
    // });
    console.log("result", result);
    return result;
}

module.exports = { getOrderCountsBy3HourWindows, getOrderCountsBy7DayWindows }