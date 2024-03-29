
/**
 * @description 实例传入through2()中, encode加密
 */
 function encode(chunk, enc, callback) {
   for(let i = 0 ; i < chunk.length; i++){
     chunk[i] = 255 - chunk[i]
   }
   this.push(chunk)
   callback()
 }

/**
 * @description 实例传入through2()中, decode解密
 */
 function decode(chunk, enc, callback) {
  for(let i = 0 ; i < chunk.length; i++){
    chunk[i] = 255 - chunk[i]
  }
  this.push(chunk)
  callback()
}

module.exports.encode = encode
module.exports.decode = decode