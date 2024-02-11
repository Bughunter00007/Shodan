const express = require('express');
const axios = require('axios');
const paginate = require('./public/pagination');

const app = express();
const port = 3000;

const SHODAN_API_KEY = 'YOUR_SHODAN_API_KEY';
const RESULTS_PER_PAGE = 10;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files like CSS

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    const result = await performSearch(query);
    const paginatedResult = paginate(result, RESULTS_PER_PAGE, 1);
    res.render('search', { result: paginatedResult, query });
  } catch (error) {
    console.error(error);
    res.render('error');
  }
});

app.get('/search/:page', async (req, res) => {
  try {
    const { query, page } = req.query;
    const result = await performSearch(query);
    const paginatedResult = paginate(result, RESULTS_PER_PAGE, page);
    res.render('search', { result: paginatedResult, query, currentPage: parseInt(page), totalPages: Math.ceil(result.length / RESULTS_PER_PAGE) });
  } catch (error) {
    console.error(error);
    res.render('error');
  }
});

async function performSearch(query) {
  try {
    const response = await axios.get(`https://api.shodan.io/shodan/host/search?key=${SHODAN_API_KEY}&query=${query}`);
    const formattedResults = response.data.matches.map(match => ({
      ip: match.ip_str,
      port: match.port,
      organization: match.org,
      operatingSystem: match.os,
      location: match.location.country_name
    }));
    return formattedResults;
  } catch (error) {
    throw error;
  }
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
