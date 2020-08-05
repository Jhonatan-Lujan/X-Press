const express = require('express');
const apiArtists = express.Router();
const sqlite3 = require('sqlite3');
const apiRouter = require('./api');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
});


apiArtists.param('artistId', (req, res, next, artistId) => {

    db.get(`SELECT * FROM Artist WHERE id = $artistId`, {
            $artistId: artistId
        },
        (error, row) => {
            if (error) {
                next(error);
            } else if (row) {
                req.artist = row;
                next()
            } else {
                res.status(404).send();
            }
        })
})


apiArtists.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Artist WHERE is_currently_employed = 1`,
        (error, rows) => {
            if (error) {
                next(error);
            } else {
                res.status(200).json({
                    artists: rows
                });
            }
        });
})

apiArtists.get('/:artistId', (req, res, next) => {
    res.status(200).json({
        artist: req.artist
    });
})

apiArtists.post('/', (req, res, next) => {
    const newArtist = req.body.artist;
    if (!newArtist.name || !newArtist.dateOfBirth || !newArtist.biography) {
        return res.status(400).send();
    }
    if(!(newArtist.is_currently_employed === 0)){
        newArtist.is_currently_employed = 1;
    }
    db.run(`INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed)
        VALUES ($name, $dateOfBirth, $biography, $is_currently_employed)`, 
        {
            $name: newArtist.name,
            $dateOfBirth: newArtist.dateOfBirth,
            $biography: newArtist.biography,
            $is_currently_employed: newArtist.is_currently_employed
        },
        function (error) {
            if (error) {
                next(error);
            } else {
                db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`,
                    (error, row) => {
                        if (error) {
                            next(error);
                        } else {
                            res.status(201).json({
                                artist: row
                            });
                        }
                    }
                )
            }
        })
})

apiArtists.put('/:artistId', (req, res, next) => {
    const newArtist = req.body.artist;
    if (!newArtist.name || !newArtist.dateOfBirth || !newArtist.biography) {
        return res.status(400).send();
    }
    if(!(newArtist.is_currently_employed === 0)){
        newArtist.is_currently_employed = 1;
    }
    db.run(`UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $is_currently_employed WHERE id = $id`,
    {
        $id: req.artist.id, 
        $name: newArtist.name,
        $dateOfBirth: newArtist.dateOfBirth,
        $biography: newArtist.biography,
        $is_currently_employed: newArtist.is_currently_employed,
    },
    function(error){
        if (error){
            next(error)
        }else{
            db.get(`SELECT * FROM Artist WHERE id = ${req.artist.id}`,
                    (error, row) => {
                        if (error) {
                            next(error);
                        } else {
                            res.status(200).json({
                                artist: row
                            });
                        }
                    }
                )
        }
    })
})

apiArtists.delete('/:artistId', (req, res, next) => {
    db.run(`UPDATE Artist SET is_currently_employed = 0 WHERE id = $id`,
    {
        $id: req.artist.id
    },
    (error)=>{
        if (error){
            next(error)
        }else{
            db.get(`SELECT * FROM Artist WHERE id = ${req.artist.id}`,
                    (error, row) => {
                        if (error) {
                            next(error);
                        } else {
                            res.status(200).json({
                                artist: row
                            });
                        }
                    }
                )
        }
    })
})


module.exports = apiArtists;