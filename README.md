# URL Shortener Backend Application

This is a simple backend service for shortening long URLs. The service accepts a long URL and returns a shortened version. It also allows users to retrieve the original long URL by using the shortened URL.

## Features

- Shortens long URLs.
- Redirects short URLs to the original long URL.
- Simple and minimalistic API.
- Basic error handling for invalid URLs.
- Stores URL mappings in a database.

## API Endpoints

### 1. Shorten URL
**Endpoint**: `/api/v1/url-shortener`

- **Method**: `POST`
- **Description**: Takes a long URL and returns a shortened URL.
- **Request Body**:
    ```json
    {
      "url": "https://www.example.com/some/long/url"
    }
    ```
- **Response**:
    ```json
    {
        "id": 14,
        "short_url": "f4f6b0", //code can be anything
        "original_url": "https://www.example.com/some/long/url",
        "updatedAt": "2024-09-24T17:04:02.092Z", //time can be anything
        "createdAt": "2024-09-24T17:04:02.092Z" //time can be anything
    }
    ```

### 2. Redirect to Long URL
**Endpoint**: `/{shortUrl}`

- **Method**: `GET`
- **Description**: Redirects the user to the original long URL using the short URL.
- **Example**: Accessing `http://localhost:8080/abcd1234` will redirect to `https://www.example.com/some/long/url`.

### 3. Error Handling
If the requested short URL does not exist, the API will return an appropriate 404 error response.

### 4. URL Validation
The application will validate the submitted long URL and return a 400 error if the URL format is invalid.

## How It Works

1. A user submits a long URL to the `/api/v1/url-shortener` endpoint.
2. The application checks the database for existing short URLs for the same long URL.
3. If it exists, it returns the existing shortened URL.
4. If not, the application generates a unique short URL and saves the mapping in the database.
5. The user can then access the shortened URL, and the service will redirect them to the original long URL.

## Technology Stack

- **Backend Framework**: Node.js with Express.
- **Database**: MySQL.
- **Short URL Generation**: A custom algorithm that ensures unique shortened URLs.

## Getting Started

### Prerequisites

- Node.js and Express.
- MySQL for storing URLs.

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/url-shortner.git
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the server in dev:
    ```bash
    npm run dev

### Environment Variables

for environment varibles look at the .env.example file and just rename to .env and replacee values.


### Contribution

you can just simply create issue and PR or can ask question in discussion section.


<p align="center"> Made with ❤️ by <a href="https://github.com/gkumar9891">Gaurav Kumar</a></p>
