export const difference = <T>(setA: Set<T>, setB: Set<T>): Set<T> => {
    const difference = new Set(setA);
    for (let elem of setB) {
        difference.delete(elem);
    }
    return difference;
}