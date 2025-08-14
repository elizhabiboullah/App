import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * @param {Array} updates
 * @returns {Promise}
 */
function applyUpdates(updates) {
    const transactionPromises = [];
    const otherUpdates = [];

    updates.forEach((update) => {
        if (update.onyxMethod === Onyx.METHOD.MERGE && update.key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION)) {
            const transactionPromise = new Promise((resolve) => {
                const connectionID = Onyx.connect({
                    key: update.key,
                    callback: (existingTransaction) => {
                        Onyx.disconnect(connectionID);

                        const newTransaction = update.value;
                        const mergedTransaction = {...existingTransaction, ...newTransaction};

                        if (existingTransaction && existingTransaction.category && !newTransaction.category) {
                            mergedTransaction.category = existingTransaction.category;
                        }

                        Onyx.merge(update.key, mergedTransaction).then(resolve);
                    },
                });
            });
            transactionPromises.push(transactionPromise);
        } else {
            otherUpdates.push(update);
        }
    });

    return Promise.all(transactionPromises).then(() => Onyx.update(otherUpdates));
}

export {
    // eslint-disable-next-line import/prefer-default-export
    applyUpdates,
};
