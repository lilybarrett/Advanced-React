describe('sample test 101', () => {
    console.log('I am running some tests!');
    it('works as expected', () => {
        let age = 100;
        expect(1).toEqual(1);
        expect(age).toEqual(100);
    })

    it('handles ranges just fine', () => {
        const age = 200;
        expect(age).toBeGreaterThan(100);
    })
})