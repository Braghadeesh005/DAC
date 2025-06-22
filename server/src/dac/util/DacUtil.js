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

}
