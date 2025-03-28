import axios from 'axios';

export const API_NodeJS = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BACKEND,
    headers: {
        "Content-Type": "application/json"
    },
    validateStatus: () => true 
});
