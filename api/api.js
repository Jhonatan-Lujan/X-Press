const express = require('express');
const apiRouter = express.Router();
const apiArtists = require('./artists');
const apiSeries = require('./series');
const apiIssues = require('./issues')

apiRouter.use('/artists', apiArtists);
apiRouter.use('/series', apiSeries);
apiSeries.use('/:seriesId/issues', apiIssues);

module.exports = apiRouter;