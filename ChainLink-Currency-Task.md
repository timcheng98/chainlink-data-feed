### Take home task

Please submit this task to us in a public github/gitlab repository.

We'd like you to familiarize yourself with a small, but foundational part of our tech stack. This
task should not take a lot of time but ensures that we're on the same page when you onboard
and we have the basics covered on which we will be building upon during your first weeks.

This task can be completed in JS/TS. Golang is a plus.

Create an http webserver using any RESTful framework of your choice.

Application requirements:
- fetch USD exchange rates for multiple cryptocurrencies (USDBTC, USDMATIC, USDETH, USDBNB, etc more is better) from any Oracle network like Chainlink (https://data.chain.link/), once per minute.
- periodically store the exchange rate in a sensible database of your choice.
- implement API endpoints against the database
    + get the last price
    + get the price at a given timestamp, come up with a way to serve a price if you don't have price at the requested second
    + compute the average price in a time range
- The function and endpoint should be sufficiently tested. We recommend using jest.
- For generating dummy data for tests, please use a fixture framework of your choice. 
- Use any data migration tools of your choice, for creating tables and/or data automatically. 

The application must be containerized. Use docker compose for orchestrating your tests and application.

Please also outline the basic steps in a `README.md` file and show how to query the endpoints with `curl`.

On-site Development

After you've submitted your source code and link to the app and we deem it to be of sufficient
quality, we will invite you for a pairing session in which we will develop your app further by
adding new features. We will work together for 30-60 minutes to sketch out and implement new
capabilities to the app. We're interested in your questions and feedback during this session and
it should be a fun and interesting experience for you
