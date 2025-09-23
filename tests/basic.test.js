describe('Basic Tests', () => {
    test('should pass a basic test', () => {
        expect(true).toBe(true);
    });

    test('should test environment setup', () => {
        expect(process.env.NODE_ENV).toBe('test');
    });
});