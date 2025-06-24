class StreamObfuscator {
    static _salt = 'S7x!';
    static _alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

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

    static _toBytes(str) {
        return Uint8Array.from(str.split('').map(c => c.charCodeAt(0)));
    }

    static _fromBytes(bytes) {
        return String.fromCharCode(...bytes);
    }

    static _base62Encode(bytes) {
        const ALPH = this._alphabet;
        let num = BigInt('0x' + Buffer.from(bytes).toString('hex'));
        if (num === 0n) return ALPH[0];
        let encoded = '';
        while (num > 0n) {
        const rem = num % 62n;
        encoded = ALPH[Number(rem)] + encoded;
        num /= 62n;
        }
        return encoded;
    }

    static _base62Decode(str) {
        const ALPH = this._alphabet;
        let num = 0n;
        for (const ch of str) {
        num = num * 62n + BigInt(ALPH.indexOf(ch));
        }
        let hex = num.toString(16);
        if (hex.length % 2) hex = '0' + hex;
        return Uint8Array.from(Buffer.from(hex, 'hex'));
    }

    static encrypt(text) {
        const length = text.length;
        let transformed = '';
        for (let i = 0; i < length; i++) {
        transformed += this._transformChar(text[i], i, length);
        }
        const mid = Math.floor(length / 2);
        const shuffled = transformed.slice(mid) + transformed.slice(0, mid);
        const bytes = this._toBytes(shuffled);
        return this._base62Encode(bytes);
    }

    static decrypt(obf) {
        if (obf == null) return null;
        const decodedBytes = this._base62Decode(obf);
        const shuffled = this._fromBytes(decodedBytes);
        const length = shuffled.length, mid = Math.floor(length / 2);
        const unshuffled = shuffled.slice(-mid) + shuffled.slice(0, -mid);
        let original = '';
        for (let i = 0; i < length; i++) {
        original += this._restoreChar(unshuffled[i], i, length);
        }
        return original;
    }
}

export default StreamObfuscator;
