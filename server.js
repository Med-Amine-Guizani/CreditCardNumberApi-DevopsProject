const express = require('express');
const crypto = require('crypto');
const winston = require('winston');
const client = require('prom-client');
const app = express();
const PORT = 3000;

app.use(express.json());


const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'luhn-validator' },
    transports: [
        new winston.transports.Console()
    ]
});


const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5],
    registers: [register]
});


const metrics = {
    totalRequests: 0,
    totalResponseTimeMs: 0,
    averageResponseTimeMs: 0,
    statusCodes: { 200: 0, 400: 0, 500: 0 }
};

app.use((req, res, next) => {
    const traceId = crypto.randomUUID();
    req.traceId = traceId;
    res.setHeader('X-Trace-Id', traceId);

    
    const endPrometheusTimer = httpRequestDuration.startTimer();

   
    logger.info({
        message: 'Incoming Request',
        traceId: traceId,
        method: req.method,
        url: req.url,
        ip: req.ip
    });

    
    metrics.totalRequests++;
    const start = process.hrtime();

    res.on('finish', () => {
      
        const diff = process.hrtime(start);
        const timeInMs = (diff[0] * 1000) + (diff[1] / 1e6);

        metrics.totalResponseTimeMs += timeInMs;
        metrics.averageResponseTimeMs = metrics.totalResponseTimeMs / metrics.totalRequests;

        const code = res.statusCode;
        metrics.statusCodes[code] = (metrics.statusCodes[code] || 0) + 1;

        
        endPrometheusTimer({ 
            method: req.method, 
            route: req.path, 
            status: code 
        });

        
        logger.info({
            message: 'Request Completed',
            traceId: traceId,
            status: code,
            durationMs: timeInMs.toFixed(2)
        });
    });

    next();
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


app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});


app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (ex) {
        res.status(500).end(ex);
    }
});


app.get('/metrics/json', (req, res) => {
    res.json({
        uptime: process.uptime(),
        requestCount: metrics.totalRequests,
        averageLatency: `${metrics.averageResponseTimeMs.toFixed(2)} ms`,
        statusBreakdown: metrics.statusCodes,
        timestamp: new Date().toISOString()
    });
});

app.post('/validate', (req, res) => {
    const { cardNumber } = req.body;

    if (!cardNumber) {
        logger.warn({
            message: 'Validation Failed',
            reason: 'Missing cardNumber field',
            traceId: req.traceId
        });
        return res.status(400).json({ error: 'Missing "cardNumber" field.' });
    }

    const isValid = luhnCheck(cardNumber);
    const issuer = getCardIssuer(cardNumber);

    logger.info({
        message: 'Card Validation Performed',
        traceId: req.traceId,
        isValid: isValid,
        issuer: issuer
    });

    
    res.json({
        isValid: isValid,
        issuer: isValid ? issuer : 'Invalid Card',
        cleanNumber: String(cardNumber).replace(/\D/g, ''),
        timestamp: new Date().toISOString(),
        traceId: req.traceId
    });
});

app.get('/', (req, res) => {
    res.send('Luhn Algorithm Validator API is Running!');
});

if (require.main === module) {
    app.listen(PORT, () => {
        logger.info({ message: `Validator running at http://localhost:${PORT}` });
    });
}


module.exports = { app, luhnCheck, getCardIssuer };