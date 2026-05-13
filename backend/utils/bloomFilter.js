// backend/utils/bloomFilter.js
class BloomFilter {
  constructor(size = 128) {
    this.size = size;
    this.bits = new Array(size).fill(0);
  }

  _hash1(value) {
    let h = 0;
    for (let i = 0; i < value.length; i++) {
      h = (h * 31 + value.charCodeAt(i)) % this.size;
    }
    return h;
  }

  _hash2(value) {
    let h = 7;
    for (let i = 0; i < value.length; i++) {
      h = (h * 17 + value.charCodeAt(i)) % this.size;
    }
    return h;
  }

  add(value) {
    this.bits[this._hash1(value)] = 1;
    this.bits[this._hash2(value)] = 1;
  }

  mightContain(value) {
    return this.bits[this._hash1(value)] === 1 && this.bits[this._hash2(value)] === 1;
  }
}

module.exports = BloomFilter;
