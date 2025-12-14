const request = require('supertest');
const { app, luhnCheck, getCardIssuer } = require('./server'); 


let server;
beforeAll(() => {
    
    jest.spyOn(console, 'log').mockImplementation(() => {}); 
});


describe('Unit Logic Tests', () => {

    
    test('luhnCheck (Simple Case)', () => {
        const result = luhnCheck('49927398716');
        if (result !== true) {
            throw new Error(`Expected true, got ${result}`);
        }
    });

  
    const luhnTests = [
        { name: "valid visa", input: "4242424242424242", expected: true },
        { name: "valid mastercard", input: "5105105105105100", expected: true },
        { name: "invalid checksum", input: "4242424242424241", expected: false }, // last digit changed
        { name: "short input", input: "1", expected: false },
        { name: "empty input", input: "", expected: false },
        { name: "non-numeric string", input: "abcdef", expected: false },
        { name: "input with dashes", input: "4242-4242-4242-4242", expected: true }, // Logic should handle sanitation
    ];

    test.each(luhnTests)('luhnCheck table test: $name', ({ input, expected }) => {
        const result = luhnCheck(input);
        expect(result).toBe(expected);
    });

    
    const issuerTests = [
        { name: "identifies Visa", input: "4242424242424242", expected: "Visa" },
        { name: "identifies MasterCard", input: "5105105105105100", expected: "Mastercard" },
        { name: "identifies Amex", input: "340000000000000", expected: "Amex" },
        { name: "unknown card", input: "1234567890123456", expected: "Unknown" },
    ];

    test.each(issuerTests)('getCardIssuer table test: $name', ({ input, expected }) => {
        const result = getCardIssuer(input);
        expect(result).toBe(expected);
    });
});


describe('API Handler Tests', () => {
    
  
    const apiTests = [
        { 
            name: "valid visa", 
            body: { cardNumber: "4242424242424242" }, 
            expectedStatus: 200, 
            expectedValid: true, 
            expectedIssuer: "Visa" 
        },
        { 
            name: "invalid checksum", 
            body: { cardNumber: "4242424242424241" }, 
            expectedStatus: 200, 
            expectedValid: false, 
            expectedIssuer: "Invalid Card" 
        },
        { 
            name: "missing parameter", 
            body: {}, 
            expectedStatus: 400, 
            expectError: true 
        },
    ];

    test.each(apiTests)('$name', async ({ body, expectedStatus, expectedValid, expectedIssuer, expectError }) => {
        const res = await request(app).post('/validate').send(body);

        expect(res.statusCode).toBe(expectedStatus);

        if (expectError) {
            expect(res.body).toHaveProperty('error');
        } else {
            expect(res.body.isValid).toBe(expectedValid);
            expect(res.body.issuer).toBe(expectedIssuer);
        }
    });

    test('GET /validate should fail (Method check)', async () => {
        const res = await request(app).get('/validate');
        expect(res.statusCode).not.toBe(200); 
    });
});


describe('Benchmarks', () => {
    
    test('Benchmark luhnCheck (1,000,000 iterations)', () => {
        const start = performance.now();
        const n = 1_000_000;
        
        for (let i = 0; i < n; i++) {
            luhnCheck("4242424242424242");
        }

        const duration = performance.now() - start;
        console.info(`\nBenchmark luhnCheck: ${n} ops in ${duration.toFixed(2)}ms (${(duration/n).toFixed(6)} ms/op)`);
        
        
        expect(duration).toBeGreaterThan(0);
    });

    test('Benchmark getCardIssuer (1,000,000 iterations)', () => {
        const start = performance.now();
        const n = 1_000_000;
        
        for (let i = 0; i < n; i++) {
            getCardIssuer("4242424242424242");
        }

        const duration = performance.now() - start;
        console.info(`\nBenchmark getCardIssuer: ${n} ops in ${duration.toFixed(2)}ms (${(duration/n).toFixed(6)} ms/op)`);
        expect(duration).toBeGreaterThan(0);
    });
});