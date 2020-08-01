# Progressive-budget

## Table of contents
[Description](#description)

[Installation](#installation)

[Usage](#usage)

[Author](#author)

[License](#license)

[Contributing](#contributing)

[Tests](#tests)

[Contact](#contact)


## Description
A node.js web application which stores budget and transactions data in a mongoDB database. Users can make a transaction and view their remaining budget. This is a progressive web application which also works offline (transaction requests are stored locally when offline and are submitted to the database when the app is next online).

## Installation
Access the deployed site at https://jjd-progressive-budget.herokuapp.com/

Alternatively, if you want to run the application locally, follow these steps:

1. Download the code repository

2. Open your terminal, type the following command and hit enter:

`mongod`

If this does not run, you will need to install mongoDB by following these [instructions](https://docs.mongodb.com/manual/installation/)

3. Open a separate instance of your terminal and navigate to the downloaded repository

4. Type the following command and hit enter:

`npm install`


## Usage
To run the application locally, open your terminal and navigate to the downloaded repository in the terminal. Then type the following command and hit enter:

`node run start`

Navigate to the application URL in a web browser: http://localhost:3000/

Add transaction data to the database by entering a transaction name and amount and clicking 'add' or 'subtract'

## Author
Joe Dodgson

Github username: JoeDodgson

## Contributing
By Joe Dodgson only

## License
Open source

## Tests
No testing framework was used for this project

## Contact
For any questions about this project, please contact Joe Dodgson at the following email address:

j.dodgson@live.co.uk
