import axios from 'axios';

export const API_NodeJS = axios.create({
    // baseURL: process.env.NEXT_PUBLIC_API_BACKEND,
    baseURL: 'https://server-do-an-tot-nghiep.vercel.app/api/',
    headers: {
        "Content-Type": "application/json"
    },
    validateStatus: () => true 
});
