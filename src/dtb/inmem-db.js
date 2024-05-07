const database = {
    _data: [
        {
            id: 0,
            firstName: 'Hendrik',
            lastName: 'van Dam',
            emailAdress: 'hvd@server.nl'
        },
        {
            id: 1,
            firstName: 'Marieke',
            lastName: 'Jansen',
            emailAdress: 'm@server.nl'
        }
    ],
    _index: 2,

    getAll(callback) {
        setTimeout(() => {
            const returnData = [];
            this._data.forEach((data) => {
                returnData.push({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    emailAdress: data.emailAdress
                });
            });
            callback(null, returnData);
        }, 1500);
    },

    getById(id, callback) {
        setTimeout(() => {
            if (id < 0 || id >= this._data.length) {
                callback({status: 500, message: `Error: id ${id} does not exist!` }, null);
            } else {
                callback(null, this._data[id]);
            }
        }, 1500);
    },

    add(item, callback) {
        setTimeout(() => {
            for (let i = 0; i < this._data.length; i++) {
                if (this._data[i].emailAdress === item.emailAdress) {
                    callback({status: 500, message: `The email: ${item.emailAdress} already exists!`}, null);
                    return;
                }
            }
            item.id = this._index++;
            this._data.push(item);
            callback(null, item);
        }, 1500);
    },

    update(oldItemId, item, callback) {
        setTimeout(() => {
            if (oldItemId < 0 || oldItemId >= this._data.length) {
                callback({status: 500,  message: `Error: id ${oldItemId} does not exist!` }, null);
            } else {
                for (let i = 0; i < this._data.length; i++) {
                    if (this._data[i].emailAdress === item.emailAdress) {
                        callback({status: 500, message: `The email: ${item.emailAdress} already exists!`}, null);
                        return;
                    }
                }
                item.id = oldItemId;
                this._data[oldItemId] = item;
                callback(null, this._data[oldItemId]);
            }
        }, 1500);
    },

    delete(itemId, callback) {
        setTimeout(() => {
            if (itemId < 0 || itemId >= this._data.length) {
                callback({status: 500,  message: `Error: id ${itemId} does not exist!` }, null);
            } else {
                this._data.slice(itemId, 1);
                this._data.forEach((entry) => {
                    if (entry.id > itemId) {
                        entry.id--;
                    }
                });
                this._index--;
                callback(null, itemId);
            }
        }, 1500);
    }
}

export default database;
