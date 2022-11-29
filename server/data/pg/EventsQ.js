const DataBase = require('../db');

class EventsQ extends DataBase {
    constructor() {
        super('events');
        this.valideKeys = new Set(['author', 'title', 'description', 'start', 'finish', 'colour', 'type', 'calendar_id']);
    }

    WhereAuthor(author) {
        this.currentStmt.text = this.currentStmt.text + ' WHERE author=$1';
        this.currentStmt.values = [author];

        return this;
    }
    WhereStart(start, sign = '=') {
        let clause;

        if(this.currentStmt.text.includes('WHERE')) {
            clause = ` and start${sign}$${this.currentStmt.values.length + 1}`;
            this.currentStmt.values.push(start);
        }
            
        else {
            clause = ` WHERE start${sign}$1`;
            this.currentStmt.values = [start];
        }
        this.currentStmt.text = this.currentStmt.text + clause;
        return this;
    }
    WhereCalendarID(calendar_id) {
        this.currentStmt.text = this.currentStmt.text + ' WHERE calendar_id=$1';
        this.currentStmt.values = [calendar_id];

        return this;
    }

    WhereID(id) {
        this.currentStmt.text = this.currentStmt.text + ' WHERE id=$1';
        this.currentStmt.values = [id];

        return this;
    }

    WhereNeedNotification() {
        this.currentStmt.text = this.currentStmt.text + ` WHERE start - now() < '1:00:00' and start > now()`;

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

    Insert({ author, title, description, start, finish, colour, type, calendar_id}) {
        this.qInsertStmt.text += ` ( author, title, description, start, finish, colour, type, calendar_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`;
        this.qInsertStmt.values = [ author, title, description, start, finish, colour, type, calendar_id];
        this.currentStmt = {...this.qInsertStmt};

        return this;
    }
}

module.exports = EventsQ;