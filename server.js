const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());


const metrics = {
    totalRequests: 0,
    totalResponseTimeMs: 0,
    averageResponseTimeMs: 0,
    statusCodes: {
        200: 0,
        400: 0,
        500: 0
    }
};


app.use((req, res, next) => {
    
    metrics.totalRequests++;

    
    const start = process.hrtime();

    
    res.on('finish', () => {
        
        const diff = process.hrtime(start);
       
        const timeInMs = (diff[0] * 1000) + (diff[1] / 1e6);

        
        metrics.totalResponseTimeMs += timeInMs;
        metrics.averageResponseTimeMs = metrics.totalResponseTimeMs / metrics.totalRequests;

        
        const code = res.statusCode;
        metrics.statusCodes[code] = (metrics.statusCodes[code] || 0) + 1;
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



app.get('/metrics', (req, res) => {
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
        return res.status(400).json({ error: 'Missing "cardNumber" field.' });
    }

    const isValid = luhnCheck(cardNumber);
    const issuer = getCardIssuer(cardNumber);

    res.json({
        isValid: isValid,
        issuer: isValid ? issuer : 'Invalid Card',
        cleanNumber: String(cardNumber).replace(/\D/g, ''),
        timestamp: new Date().toISOString()
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Validator running at http://localhost:${PORT}`);
    });
}

module.exports = { app, luhnCheck, getCardIssuer };