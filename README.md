# New York Times Crossword Leaderboard Scraper

## Overview
Reads data from nytimes mini crossword leaderboard.  
Stores data inside MongoDB stored on persistent volume withing docker container.  
Provides front end view on [localhost:3000](http://localhost:3000).

 ![Nytimes Leaderboard Example Screenshot](/imgs/nytimes-example-screenshot.png)

## Running the Application  
Before running the application you need to get your NYT authentication cookie.  
To acquire the cookie, do the following:

- Visit http://nytimes.com/crosswords
- Login to your account
- Inspect Element
- Navigate to the Storage Tab
- Click nytimes.com
- Select Cookies
- Copy the NYT-S cookie value

Once you have acquired the cookie, paste it into the Dockerfile in the format shown below. (Line 17)
```
ENV COOKIE="NYT-S=[your_cookie]"
```

Example cookie: 
```
1oa.1Anz9X85cR14fDAgT7hYzLdVdkw/2Pwui0ZI53fTnifqDjK4G2NtT2KXQt9Gb.jOoea6bgYnQ18748eEJw6wqwB9nfLnvCOLnRUMUpZZcwOatwg00^^^^CBISJQjJwvWVBhDBw_WVBhoSMS1-BS-djFcP1zSAUYdWeGnXIPnU7VcaQHS4OepnPUI_j04S7rKETWDvASuvJ5J0RIpEOb1lr4JenkmoPf7E9DbrDWgTwfNboREK65ZihIl_suX-NshYqwE=
```

You can now start the application with the following commands:
```
docker-compose build
docker-compose up -d
```

Access the application at http://localhost:3000