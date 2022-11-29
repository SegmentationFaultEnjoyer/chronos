const DataBase = require('../db');

class UsersCalendarsQ extends DataBase {
    constructor() {
        super('users_calendars');
        this.valideKeys = new Set(['user_id', 'calendar_id', 'role']);
    }

    Insert({ user_id, calendar_id, role }) {
        this.qInsertStmt.text += ` (user_id, calendar_id, role) 
        VALUES(${new Array(3).fill('').map((_, i) => `$${i + 1}`).join(', ')})`;
        this.qInsertStmt.values = [user_id, calendar_id, role];
        this.currentStmt = {...this.qInsertStmt};
        return this;
    }

    WhereType(type) {
        let clause;

        if(this.currentStmt.text.includes('WHERE')) {
            clause = ' and type=$2';
            this.currentStmt.values.push(type);
        }
            
        else {
            clause = ' WHERE type=$1';
            this.currentStmt.values = [type];
        }
        this.currentStmt.text = this.currentStmt.text + clause;
        return this;
    }

    WhereUserID(user_id) {
        let clause;

        if(this.currentStmt.text.includes('WHERE')) {
            clause = ' and user_id=$2';
            this.currentStmt.values.push(user_id);
        }
            
        else {
            clause = ' WHERE user_id=$1';
            this.currentStmt.values = [user_id];
        }
           
        this.currentStmt.text = this.currentStmt.text + clause;
        
        return this;
    }

    WhereUserRole(role, conjuction = "AND") {
        let clause;

        if(this.currentStmt.text.includes('WHERE')) {
            clause = ` ${conjuction} role=$2`;
            this.currentStmt.values.push(role);
        }
            
        else {
            clause = ' WHERE role=$1';
            this.currentStmt.values = [role];
        }

        this.currentStmt.text = this.currentStmt.text + clause;

        return this;
    }

    WhereHasPermission() {
        let clause;

        if(this.currentStmt.text.includes('WHERE')) {
            clause = ` AND (role = 'admin' OR status = true)`;
        }
            
        else {
            clause = ' WHERE role=$1';
        }

        this.currentStmt.text = this.currentStmt.text + clause;

        return this;
    }

    WhereCalendarID(calendar_id) {
        let clause;

        if(this.currentStmt.text.includes('WHERE')) {
            clause = ' and calendar_id=$2';
            this.currentStmt.values.push(calendar_id);
        }
            
        else {
            clause = ' WHERE calendar_id=$1';
            this.currentStmt.values = [calendar_id];
        }
           
        this.currentStmt.text = this.currentStmt.text + clause;
        
        return this;
    }

    OrderByID(orderType = "DESC") {
        this.currentStmt.text = this.currentStmt.text + ` ORDER BY id ${orderType}`;
        
        return this;
    }

    OrderByPublishDate(orderType = "DESC") {
        this.currentStmt.text = this.currentStmt.text + ` ORDER BY publish_date ${orderType}`;
        
        return this;
    }

    OrderByAuthor(orderType = "DESC") {
        this.currentStmt.text = this.currentStmt.text + ` ORDER BY author ${orderType}`;
        
        return this;
    }
    
}

module.exports = UsersCalendarsQ;