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
            callback(null, this._data);
        }, 1500);
    },

    getById(id, callback) {
        setTimeout(() => {
            if (id < 0 || id >= this._data.length) {
                callback({ message: `Error: id ${id} does not exist!` }, null);
            } else {
                callback(null, this._data[id]);
            }
        }, 1500)
    },

    add(item, callback) {
        setTimeout(() => {
            item.id = this._index++;
            this._data.push(item);
            callback(null, item);
        }, 1500)
    }
}

export default database;
