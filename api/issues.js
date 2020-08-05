const express = require('express');
const apiIssues = express.Router({
    mergeParams: true
});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
});

apiIssues.param('issueId', (req, res, next, issueId) => {
    db.get(`SELECT * FROM Issue WHERE id=${issueId}`,
    (error, row) => {
        if(error){
            next(error);
        } else if (row){
            req.issue = row;
            next()
        } else {
            res.status(404).send();
        }
    });
});

apiIssues.get('/', (req, res, next) => {
            db.all(`SELECT * FROM Issue WHERE series_id = ${req.params.seriesId}`,
                (error, rows) => {
                    if (error) {
                        next(error);
                    } else {
                        res.status(200).json({
                            issues: rows
                        });
                    }
                }
            );
});

apiIssues.post('/', (req, res, next) => {
    const newIssue = req.body.issue;
    if(!newIssue.name || !newIssue.issueNumber  || !newIssue.publicationDate  || !newIssue.artistId){
        res.status(400).send();
    }
    db.get(`SELECT * FROM Artist WHERE id = ${newIssue.artistId}`,
    (error, row) => {
        if (error){
            next(error);
        } else if(row){
            db.run('INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)', 
            {
                $name: newIssue.name,
                $issueNumber: newIssue.issueNumber,
                $publicationDate: newIssue.publicationDate,
                $artistId: newIssue.artistId,
                $seriesId: req.serie.id
            },
            function(error){
                if (error){
                    next(error);
                }else{
                    db.get(`SELECT * FROM Issue WHERE id=${this.lastID}`,
                    (error, row)=>{
                        if (error){
                            next(error)
                        }else{
                            res.status(201).json({issue: row});
                        }
                    })
                }
            })
        }else{
            res.status(400).send();
        }
    })
})

apiIssues.put('/:issueId', (req, res, next) => {
    const newIssue = req.body.issue;
    if(! newIssue.name || !newIssue.issueNumber || !newIssue.publicationDate || !newIssue.artistId){
        res.status(400).send();
    }
        db.get(`SELECT * FROM Artist WHERE id = ${newIssue.artistId}`,
        (error, row) => {
            if (error){
                next(error);
            } else if(row){
                db.run(`UPDATE Issue SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId WHERE id = $issueId`,
                {
                    $name: newIssue.name,
                    $issueNumber: newIssue.issueNumber,
                    $publicationDate: newIssue.publicationDate,
                    $artistId: newIssue.artistId,
                    $issueId: req.issue.id
                },
                function(error, row){
                    if (error) {
                        next(error)
                    } else {
                        db.get(`SELECT * FROM Issue WHERE id = ${req.issue.id}`, 
                        (error, row) => {
                            if (error){
                                next(error);
                            } else {
                                res.status(200).json({issue: row});
                            }
                        });
                    }
                });
            } else {
                res.status(400).send()
            }
        })
    
});


apiIssues.delete('/:issueId', (req, res, next) => {
    db.run(`DELETE FROM Issue WHERE id = ${req.issue.id}`,
    (error)=>{
        if(error){
            next(error);
        } else {
            res.status(204).send();
        }
    })
})

module.exports = apiIssues;