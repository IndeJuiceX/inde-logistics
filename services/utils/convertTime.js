export function convertTime(timestamp) {
    const date = new Date(timestamp);

    // Use Intl.DateTimeFormat for better localization and formatting
    const options = {
        timeZone: 'Europe/London', // Change to your desired time zone or omit for local time
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    };

    // Format the date
    const formatter = new Intl.DateTimeFormat('en-GB', options);
    const formattedDate = formatter.format(date);

    // Add day suffix
    const day = date.getUTCDate();
    const suffix = getDaySuffix(day);
    const formattedDateWithSuffix = formattedDate.replace(
        /\b(\d{1,2})\b/,
        `$1${suffix}`
    );

    // Calculate the relative time
    const now = new Date();
    const differenceInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const relativeTime = getRelativeTime(differenceInSeconds);

    return `${formattedDateWithSuffix} (${relativeTime})`;
}
export function getDateAndTime(timestamp) {
    const formattedTimestamp = new Date(timestamp).toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
    return formattedTimestamp;
}
function getDaySuffix(day) {
    if (day >= 11 && day <= 13) {
        return 'th';
    }
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

function getRelativeTime(seconds) {
    const absSeconds = Math.abs(seconds);
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    if (absSeconds < 60) {
        // Less than a minute
        return rtf.format(Math.round(-seconds), 'second');
    } else if (absSeconds < 3600) {
        // Less than an hour
        const minutes = Math.round(-seconds / 60);
        return rtf.format(minutes, 'minute');
    } else if (absSeconds < 86400) {
        // Less than a day
        const hours = Math.round(-seconds / 3600);
        return rtf.format(hours, 'hour');
    } else if (absSeconds < 604800) {
        // Less than a week
        const days = Math.round(-seconds / 86400);
        return rtf.format(days, 'day');
    } else if (absSeconds < 2629800) {
        // Less than a month (approx 30.44 days)
        const weeks = Math.round(-seconds / 604800);
        return rtf.format(weeks, 'week');
    } else if (absSeconds < 31557600) {
        // Less than a year (approx 365.25 days)
        const months = Math.round(-seconds / 2629800);
        return rtf.format(months, 'month');
    } else {
        // More than a year
        const years = Math.round(-seconds / 31557600);
        return rtf.format(years, 'year');
    }
}