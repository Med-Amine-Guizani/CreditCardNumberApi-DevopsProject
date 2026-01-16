const express = require('express');
const crypto = require('crypto');
const winston = require('winston');
const client = require('prom-client'); 
const app = express();
const PORT = 3000;

app.use(express.json());


const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    defaultMeta: { service: 'luhn-validator' },
    transports: [new winston.transports.Console()]
});


const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics(); 


const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status']
});

const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5] 
});


app.use((req, res, next) => {
    const traceId = crypto.randomUUID();
    req.traceId = traceId;
    res.setHeader('X-Trace-Id', traceId);

    logger.info({ message: 'Incoming Request', traceId, method: req.method, url: req.url });

    
    const end = httpRequestDuration.startTimer();

    res.on('finish', () => {
        
        end({ method: req.method, route: req.path, status: res.statusCode });

        
        httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });

        logger.info({ message: 'Request Completed', traceId, status: res.statusCode });
    });

    next();
});




app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.send(await client.register.metrics());
});


const luhnCheck = (num) => {
    const sanitized = String(num).replace(/\D/g, '');
    if (sanitized.length < 2) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = sanitized.length - 1; i >= 0; i--) {
        let digit = parseInt(sanitized.charAt(i), 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return (sum % 10) === 0;
};

const getCardIssuer = (number) => {
    const sanitized = String(number).replace(/\D/g, '');
    const patterns = {
        visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
        mastercard: /^5[1-5][0-9]{14}$|^2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9][0-9]|7(?:[01][0-9]|20))[0-9]{12}$/,
        amex: /^3[47][0-9]{13}$/,
        discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
        diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
        jcb: /^(?:2131|1800|35\d{3})\d{11}$/
    };

    for (const [issuer, regex] of Object.entries(patterns)) {
        if (regex.test(sanitized)) {
            return issuer.charAt(0).toUpperCase() + issuer.slice(1);
        }
    }
    return 'Unknown';
};

app.post('/validate', (req, res) => {
    const { cardNumber } = req.body;
    if (!cardNumber) {
        logger.warn({ message: 'Validation Failed', reason: 'Missing cardNumber', traceId: req.traceId });
        return res.status(400).json({ error: 'Missing "cardNumber" field.' });
    }
    const isValid = luhnCheck(cardNumber);
    const issuer = getCardIssuer(cardNumber);
    
    logger.info({ message: 'Card Validation Performed', traceId: req.traceId, isValid, issuer });
    res.json({ isValid, issuer: isValid ? issuer : 'Invalid Card', cleanNumber: String(cardNumber).replace(/\D/g, ''), traceId: req.traceId });
});

if (require.main === module) {
    app.listen(PORT, () => {
        logger.info({ message: `Validator running at http://localhost:${PORT}` });
    });
}
module.exports = { app };