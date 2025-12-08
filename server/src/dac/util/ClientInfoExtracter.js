import Level from "../conf/Level.js";
import DacLogger from "./DacLogger.js";
const LOGGER = new DacLogger("ClientInfoExtractor.js");

class ClientInfoExtractor {

    static extract(req) {
        let ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;
        ip = this.normalizeIP(ip);
        const userAgent = req.headers["user-agent"] || "";
        const os = this.detectOS(userAgent);
        const browser = this.detectBrowser(userAgent);
        const deviceType = this.detectDeviceType(userAgent);
        LOGGER.log(Level.INFO, `Fetched IP: ${ip}, OS: ${os}, Browser: ${browser}, Device: ${deviceType}`);
        return { ip, os, browser, deviceType };
    }

    static normalizeIP(ip) {
        if (!ip) return "Unknown";
        ip = ip.trim();
        ip = ip.replace(/^\[|\]$/g, "");
        if (ip === "::1" || ip === "0:0:0:0:0:0:0:1")
            return "127.0.0.1";
        if (ip.startsWith("::ffff:"))
            return ip.replace("::ffff:", "");
        if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip))
            return ip;
        return ip;
    }

    static detectOS(ua) {
        if (/windows nt/i.test(ua)) return "Windows";
        if (/macintosh|mac os x/i.test(ua)) return "macOS";
        if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
        if (/android/i.test(ua)) return "Android";
        if (/linux/i.test(ua)) return "Linux";
        return "Unknown OS";
    }

    static detectBrowser(ua) {
        if (/edg/i.test(ua)) return "Edge";
        if (/chrome/i.test(ua) && !/edg/i.test(ua)) return "Chrome";
        if (/firefox/i.test(ua)) return "Firefox";
        if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "Safari";
        return "Unknown Browser";
    }

    static detectDeviceType(ua) {
        if (/mobile/i.test(ua)) return "Mobile";
        if (/tablet|ipad/i.test(ua)) return "Tablet";
        return "Desktop";
    }
}

export default ClientInfoExtractor;
