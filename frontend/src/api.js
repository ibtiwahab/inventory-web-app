import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Set your backend URL here
});

export default API;
