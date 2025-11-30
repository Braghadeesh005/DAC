class DacUtil{

     static formatListToCommaSeparatedString(arr) {
        return arr
            .map(item => {
                if (this.isNullOrUndefined(item)) return 'NULL';
                if (this.isNumber(item)) return item;
                return this.encloseWithSingleQuotes(item);
            })
            .join(', ');
    }

    static isNullOrUndefined(str){
        if (str === null || str === undefined) {
            return true;
        }
        return false;
    }

    static isEmptyList(list){
        if (!list || list.length === 0) {
            return true;
        }
        return false;
    }

    static isNumber(input){
        if (typeof input === 'number') {
            return true;
        }
        return false;
    }

    static encloseWithSingleQuotes(param) {
        return `'${String(param).replace(/'/g, "''")}'`;
    }

    static getISTTimestamp() {
        const istFormatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
        });
        const parts = istFormatter.formatToParts(new Date());
        const get = type => parts.find(p => p.type === type)?.value || '00';
        const year = get('year');
        const month = get('month');
        const day = get('day');
        const hour = get('hour');
        const minute = get('minute');
        const second = get('second');
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }

    static isNullOrEmptyObject(obj) {
        if (obj === null || obj === undefined) {
            return true;
        }
        if (typeof obj !== "object" || Array.isArray(obj)) {
            throw new Error("Invalid data type. Expected a plain object.");
        }
        return Object.keys(obj).length === 0;
    }

}

export default DacUtil;