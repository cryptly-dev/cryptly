const { createHmac, timingSafeEqual } = require('crypto');

class Webhooks {
  constructor({ secret }) {
    this.secret = secret;
  }

  async verify(body, signature) {
    if (!signature) {
      return false;
    }

    const hmac = createHmac('sha256', this.secret);
    hmac.update(body);
    const expectedSignature = `sha256=${hmac.digest('hex')}`;

    if (signature.length !== expectedSignature.length) {
      return false;
    }

    const bufferA = Buffer.from(signature);
    const bufferB = Buffer.from(expectedSignature);

    return timingSafeEqual(bufferA, bufferB);
  }
}

module.exports = { Webhooks };
