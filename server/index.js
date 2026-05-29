// imports
import express from "express";
import morgan from 'morgan'; // logging middleware
import cors from 'cors'; // CORS middleware
import {check, validationResult} from 'express-validator'; // validation middleware

// init express
const app = new express();
app.use(morgan('dev'));
app.use(express.json());
const port = 3001;

/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
};
app.use(cors(corsOptions));

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});