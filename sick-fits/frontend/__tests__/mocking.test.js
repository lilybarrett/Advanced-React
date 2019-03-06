function Person(name, foods) {
    this.name = name;
    this.foods = foods;
}

Person.prototype.fetchFaveFoods = function() {
    return new Promise((resolve, reject) => {
        // Simulate an API
        setTimeout(() => resolve(this.foods), 2000);
    })
}

describe('mocking learning', () => {
    it('mocks a reg function', () => {
        const fetchDogs = jest.fn();
        // This creates a mock function
        fetchDogs('snickers');
        expect(fetchDogs).toHaveBeenCalled();
        expect(fetchDogs).toHaveBeenCalledWith('snickers');
        expect(fetchDogs).toHaveBeenCalledTimes(1);
    });

    it('can create a person', () => {
        const me = new Person('Wes', ['pizza', 'burgs']);
        expect(me.name).toBe('Wes');
    })

    it('can fetch foods', async () => {
        const me = new Person('Wes', ['pizza', 'burgs']);
        // since calling the actual function or API can be really slow, let's mock the function
        me.fetchFaveFoods = jest.fn().mockResolvedValue(['sushi', 'ramen']);
        const faveFoods = await me.fetchFaveFoods();
        expect(faveFoods).toContain('sushi');
    })
})