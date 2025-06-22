class DigestBuilder {

    static createDigest() {
        return this._hashSeed(this._generateSeed());
    }

    /*
       ** Collects 4 entropy sources - 1. Current time 2. Performance timer 3. Random Number 4. ProcessID.
       ** Each source is converted to base-36 (0-9 + a-z) to compact the data.
       ** Then it’s concatenated into a single string.
    */
    static _generateSeed() {
        const entropySources = [
            Date.now(),
            performance?.now?.() || 0,
            Math.floor(Math.random() * 1e9),
            (typeof process !== 'undefined' && process.pid) || 0
        ];
        return entropySources.map(e => e.toString(36)).join('');
    }

    /*
       ** FNV-inspired hashing approach
       ** Further Obfuscation happens using bitwise shifts, multiplication avalanche effect.
       ** Result converted to base-36 and padded to 8-10 characters.
    */
    static _hashSeed(seed) {
        const input = String(seed);
        let hash = 2166136261 >>> 0;
        for (let i = 0; i < input.length; i++) {
            hash ^= input.charCodeAt(i);
            hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
            hash = hash >>> 0;
        }
        hash ^= hash >>> 13;
        hash = (hash * 0x5bd1e995) >>> 0;
        hash ^= hash >>> 15;
        const digest = Math.abs(hash).toString(36);
        return digest.padStart(8, '0').slice(0, 10);
    }
}

export default DigestBuilder;
