class StreamObfuscator {
    static _salt = 'S7x!';
    static _transformChar(char, index, length) {
        const saltChar = this._salt.charCodeAt(index % this._salt.length);
        const shift = (index * 7 + length + saltChar) % 94;
        let newCode = char.charCodeAt(0) + shift;
        if (newCode > 126) newCode = 32 + (newCode - 127);
        return String.fromCharCode(newCode);
    }

    static _restoreChar(char, index, length) {
        const saltChar = this._salt.charCodeAt(index % this._salt.length);
        const shift = (index * 7 + length + saltChar) % 94;
        let origCode = char.charCodeAt(0) - shift;
        if (origCode < 32) origCode = 127 - (32 - origCode);
        return String.fromCharCode(origCode);
    }

    static encrypt(text) {
        const length = text.length;
        let transformed = '';
        for (let i = 0; i < length; i++) {
            transformed += this._transformChar(text[i], i, length);
        }
        const mid = Math.floor(length / 2);
        const shuffled = transformed.slice(mid) + transformed.slice(0, mid);
        return shuffled.split('').reverse().join('');
    }

    static decrypt(obfuscated) {
        if(obfuscated == null) return null;
        const reversed = obfuscated.split('').reverse().join('');
        const length = reversed.length;
        const mid = Math.floor(length / 2);
        const unshuffled = reversed.slice(-mid) + reversed.slice(0, -mid);
        let original = '';
        for (let i = 0; i < length; i++) {
            original += this._restoreChar(unshuffled[i], i, length);
        }
        return original;
    }
}

export default StreamObfuscator;
