const DataBase = require('../db')

const { hash } = require('../../helpers/hashing')

class UsersQ extends DataBase {
    constructor() {
        super('users')
        this.valideKeys = new Set(['name', 'email', 'password_hash', 'role', 'rating', 'profile_picture']);
    }

    WhereID(id) {
        this.currentStmt.text = this.currentStmt.text + ' WHERE id=$1';
        this.currentStmt.values = [id];

        return this;
    }

    WhereEmail(email) {
        this.currentStmt.text = this.currentStmt.text + ' WHERE email=$1';
        this.currentStmt.values = [email];

        return this;
    }

    OrderByID(orderType = "DESC") {
        this.currentStmt.text = this.currentStmt.text + ` ORDER BY id ${orderType}`;
        
        return this;
    }

    OrderByRating(orderType = "DESC") {
        this.currentStmt.text = this.currentStmt.text + ` ORDER BY rating ${orderType}`;
        
        return this;
    }

    OrderByRole(orderType = "DESC") {
        this.currentStmt.text = this.currentStmt.text + ` ORDER BY role ${orderType}`;
        
        return this;
    }

    Insert({name, email, password}) {
        this.qInsertStmt.text += ` (name, email, password_hash) VALUES($1, $2, $3)`;
        this.qInsertStmt.values = [name, email , password];
        this.currentStmt = {...this.qInsertStmt};

        return this;
    }
}

module.exports = UsersQ;