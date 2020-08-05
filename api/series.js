const express = require('express');
const apiSeries = express.Router();
const apiIssues = require('./issues')
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
});

apiSeries.param('seriesId', (req, res, next, seriesId) => {
    db.get(`SELECT * FROM Series WHERE id = ${seriesId}`,
        (error, row) => {
            if (error) {
                next(error);
            } else if (row) {
                req.serie = row;
                next()
            } else {
                res.status(404).send();
            }
        })
})

apiSeries.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Series`,
        (error, rows) => {
            if (error) {
                next(error);
            } else {
                res.status(200).json({
                    series: rows
                });
            }
        });
});

apiSeries.get('/:seriesId', (req, res, next) => {

    res.status(200).json({
        series: req.serie
    });

});

apiSeries.post('/', (req, res, next) => {
    const newSerie = req.body.series;
    if (!newSerie.name || !newSerie.description) {
        res.status(400).send();
    }
    db.run(`INSERT INTO Series(name, description) VALUES($name, $description)`, {
            $name: newSerie.name,
            $description: newSerie.description
        },
        function (error) {
            if (error) {
                next(error);
            } else {
                db.get(`SELECT *  FROM Series WHERE id = ${this.lastID}`,
                    (error, row) => {
                        if (error) {
                            next(error);
                        } else {
                            res.status(201).json({
                                series: row
                            });
                        }
                    });
            }
        });
});

apiSeries.put('/:seriesId', (req, res, next) => {
    const newSerie = req.body.series;
    if (!newSerie.name || !newSerie.description) {
        res.status(400).send();
    }
    db.run(`UPDATE Series SET name = $name, description = $description WHERE id=${req.serie.id}`, {
            $name: newSerie.name,
            $description: newSerie.description
        },
        function (error) {
            if (error) {
                next(error)
            } else {
                db.get(`SELECT * FROM Series WHERE id = ${req.serie.id}`,
                    (error, row) => {
                        if (error) {
                            next(error);
                        } else if (row) {
                            res.status(200).json({
                                series: row
                            });
                        } else {
                            res.status(400).send();
                        }
                    })
            }
        })
})

apiSeries.delete('/:seriesId', (req, res, next) => {
    console.log(req.serie.id)
    db.get(`SELECT * FROM Issue WHERE series_id = ${req.serie.id}`,
        (error, rows) => {
            console.log(rows)
            if (error) {
                next(error)
            } else if (rows) {
                res.status(400).send(` ${rows}`);
            } else {
                db.run(`DELETE FROM Series WHERE id = ${req.serie.id}`,
                    (error) => {
                        if (error) {
                            next(error);
                        } else {
                            res.status(204).send();
                        }
                    });
            }
        })
})

module.exports = apiSeries;