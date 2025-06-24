class AuraCrypt {

    static _simpleHash(str) {
        let hash = 0x811c9dc5;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
        }
        return (hash >>> 0).toString(16);
    }

    static _generateKeyStream(key, iv, length) {
        let stream = '';
        let prev = key + iv;
        while (stream.length < length) {
            prev = this._simpleHash(prev);
            stream += prev;
        }
        return stream.slice(0, length);
    }

    static _toUrlSafe(base64) {
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    static _fromUrlSafe(str) {
        let s = str.replace(/-/g, '+').replace(/_/g, '/');
        return s + '='.repeat((4 - s.length % 4) % 4);
    }

    static encrypt(plainText, key) {
        const iv = Array.from({length:8}, () => String.fromCharCode(Math.floor(Math.random() * 256))).join('');
        let buffer = plainText;
        const keyStream = this._generateKeyStream(key, iv, buffer.length);
        for (let round = 0; round < 3; round++) {
            let temp = '';
            for (let i = 0; i < buffer.length; i++) {
            temp += String.fromCharCode(buffer.charCodeAt(i) ^ keyStream.charCodeAt((i + round*3) % keyStream.length));
            }
            buffer = temp;
        }
        const combined = iv + buffer;
        const base64 = Buffer.from(combined, 'binary').toString('base64');
        return this._toUrlSafe(base64);
    }

    static decrypt(encryptedString, key) {
        const b64 = this._fromUrlSafe(encryptedString);
        const combined = Buffer.from(b64, 'base64').toString('binary');
        const iv = combined.slice(0, 8);
        let buffer = combined.slice(8);
        const keyStream = this._generateKeyStream(key, iv, buffer.length);
        for (let round = 2; round >= 0; round--) {
            let temp = '';
            for (let i = 0; i < buffer.length; i++) {
            temp += String.fromCharCode(buffer.charCodeAt(i) ^ keyStream.charCodeAt((i + round*3) % keyStream.length));
            }
            buffer = temp;
        }
        return buffer;
    }
}

export default AuraCrypt;
