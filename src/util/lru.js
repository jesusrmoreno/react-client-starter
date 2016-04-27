/**
 * Created by bwallace on 4/27/2016.
 */
/*
 Methods to manipulate a simple cache that eliminates oldest entries when the cache is overflowing
 All methods work with basic serializable types so this cache can be placed in a Redux store without any problems.
 The methods implement an immutable data structure, so every mutation actually returns a copy of the data structure
 */
function makeLru(maxCacheSize, items, order) {
    return { maxCacheSize, items, order };
}

function prepend(value, array) {
    array.unshift(value);
    return array;
}

function hasProperty(object, name) { return Object.prototype.hasOwnProperty.call(object, name); }

export function create(maxCacheSize = 10) { return makeLru(maxCacheSize, {}, []); }

export function add(lru, key, item, dispose) {
    if (hasProperty(lru.items, key)) {
        // this key is already in the lru.

        // construct new dictionary with the updated item if it is different
        const oldItem = lru.items[key];
        const newItems = (item === oldItem) ? lru.items : { ...lru.items, [key]: item };

        // construct a new list with our key at the front if it isn't already at the front
        const newOrder = (lru.order[0] === key) ? lru.order : prepend(key, lru.order.filter(x => x !== key));

        return (newItems === lru.items && newOrder === lru.order) ? lru : makeLru(lru.maxCacheSize, newItems, newOrder);
    }
    else {
        // This key is not yet in the lru.
        const newItems = {[key]: item};
        const newOrder = [key];
        const { items, order, maxCacheSize } = lru;
        const stop = Math.min(maxCacheSize - 1, order.length);

        // Add the remaining items, stopping if we hit our size limit
        for (let i = 0; i < stop; ++i) {
            const key = order[i];
            const item = items[key];
            newItems[key] = item;
            newOrder.push(key);
        }

        // dispose of the items dropped from the cache
        if (dispose) {
            for (let i = stop; i < order.length; ++i) {
                const key = order[i];
                const item = items[key];
                dispose(item);
            }
        }

        return makeLru(maxCacheSize, newItems, newOrder);
    }
}

export function has(lru, key) {
    return hasProperty(lru.items, key);
}

export function peek(lru, key) {
    return has(lru, key) ? lru.items[key] : undefined;
}

export function peekReplace(lru, key, item) {
    if (has(lru, key)) {
        const newItems = {...lru.items, [key]: item};
        return makeLru(lru.maxCacheSize, newItems, lru.order);
    }

    return lru;
}

/**
 * Returns an object with the removed item (or undefined) and the new lru: { item: itemOrUndefined, lru: lru }
 * @param lru
 * @param key
 * @returns {*}
 */
export function remove(lru, key) {
    if (!hasProperty(lru.items, key)) {
        // not in the cache
        return { item: undefined, lru };
    }

    const { [key]: oldItem, ...remainingItems } = lru.items;
    const newOrder = lru.order.filter(k => k !== key);
    const newLru = makeLru(lru.maxCacheSize, remainingItems, newOrder);

    return { item: oldItem, lru: newLru };
}
