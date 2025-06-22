import Level from "../conf/Level";
import DacLogger from "./DacLogger";

class ClientInfoExtractor {

    static OS_PATTERNS = [
        { pattern: /windows/i, value: 'Windows' },
        { pattern: /macintosh/i, value: 'macOS' },
        { pattern: /linux/i, value: 'Linux' },
        { pattern: /android/i, value: 'Android' },
        { pattern: /iphone|ipad/i, value: 'iOS' }
    ];
    static BROWSER_PATTERNS = [
        { pattern: /chrome/i, value: 'Chrome' },
        { pattern: /firefox/i, value: 'Firefox' },
        { pattern: /edge/i, value: 'Edge' },
        { pattern: /safari/i, value: 'Safari' }
    ];
    static DEVICE_PATTERNS = [
        { pattern: /mobile/i, value: 'Mobile' },
        { pattern: /tablet/i, value: 'Tablet' }
    ];

    static extract(req) {
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'] || '';
        const os = this.matchPattern(this.OS_PATTERNS, userAgent, 'Unknown OS');
        const browser = this.matchPattern(this.BROWSER_PATTERNS, userAgent, 'Unknown Browser', userAgent);
        const deviceType = this.matchPattern(this.DEVICE_PATTERNS, userAgent, 'Desktop');
        DacLogger.log(Level.INFO, `Fetched IP : ${ip}, OS : ${os}, BROWSER : ${browser}, DEVICE TYPE : ${deviceType}.`)
        return { ip, os, browser, deviceType };
    }

    static matchPattern(patternList, userAgent, defaultValue, fullUA = null) {
        for (const entry of patternList) {
            if (entry.pattern.test(userAgent)) {
                if (entry.value === 'Safari' && fullUA && /chrome/i.test(fullUA)) continue;
                return entry.value;
            }
        }
        return defaultValue;
    }
}

export default ClientInfoExtractor;
